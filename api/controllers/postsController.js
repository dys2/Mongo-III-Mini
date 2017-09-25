const mongoose = require('mongoose');

const Post = require('../models/post');
const Comment = require('../models/comment');

const STATUS_USER_ERROR = 422;

// const asyncPromise = (data, err, res) => {
//   data
//   .then(d => res.json(d))
//   .catch(err => res.status(STATUS_USER_ERROR).json({ error: err })); 
// }

/* Fill in each of the below controller methods */
const createPost = (req, res) => {
  const { title, text } = req.body;
  const post = new Post({ title, text });
  console.log(req.body)
  post.save()
    .then(p => res.json(p))
    .catch(err => res.status(STATUS_USER_ERROR).json({ error: err }));
};

const listPosts = (req, res) => {
  Post.find()
    .populate('comments', 'text').exec()
    .then(posts => res.json(posts))
    .catch(err => res.status(STATUS_USER_ERROR).json({ error: err }));    
};

const findPost = (req, res) => {
  const { id } = req.params;
  Post.findById(id)
    .populate('comments', 'text').exec()
    .then((post) => {
      res.json(post);
    })
    .catch(err => res.status(STATUS_USER_ERROR).json({ error: err }));    
};

const addComment = (req, res) => {
  const { text } = req.body;
  const { id } = req.params;
  const comment = new Comment({ text });
  Post.findById(id).exec()
    .then(post => {
      post.comments.push(comment);
      comment.save()
        .then(comment => res.json(comment))
        .catch(err => res.status(STATUS_USER_ERROR).json({ error: err }));        
      post.save()
        .catch(err => res.status(STATUS_USER_ERROR).json({ error: err }));        
    })
    .catch(err => res.status(STATUS_USER_ERROR).json({ error: err }));        
};

// In this function, we need to delete the comment document
// We also need to delete the comment's parent post's reference
// to the comment we just deleted
const deleteComment = (req, res) => {
  const { id, commentId } = req.params;
  Post.findById(id).exec()
    .populate('comments', 'text')
    .then((post) => {
      const index = post.comments.findIndex((comment) => commentId === comment._id);
      post.comments.splice(index, 1);
      post.save()
        .then(post => res.json(post))
        .catch(err => res.status(STATUS_USER_ERROR).json({ error: err }));
    })
    .catch(err => res.status(STATUS_USER_ERROR).json({ error: err }));    
};

// Similarly, in this function we need to delete the post document,
// along with any comments that are the children of this post
// We don't want any orphaned children in our database
const deletePost = (req, res) => {
  const { id } = req.params;
  Post.findByIdAndRemove(id)
    .then(post => res.json(`${post} was deleted`))
    .catch(err => res.status(STATUS_USER_ERROR).json({ error: err }));    
};

module.exports = {
  createPost,
  listPosts,
  findPost,
  addComment,
  deleteComment,
  deletePost
};

