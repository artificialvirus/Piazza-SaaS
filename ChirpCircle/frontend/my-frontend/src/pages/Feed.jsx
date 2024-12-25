// File: ChirpCircle/frontend/my-frontend/src/pages/Feed.jsx
import { useEffect, useState } from 'react';

function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [topic, setTopic] = useState('tech');

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/v1/posts?topic=${topic}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setPosts(data.data);
      } else {
        alert(data.message || 'Failed to fetch posts');
      }
    } catch (error) {
      console.error(error);
      alert('Error fetching posts');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [topic]);

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/v1/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh the feed
      fetchPosts();
    } catch (error) {
      alert('Error liking post');
    }
  };

  const handleDislike = async (postId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/v1/posts/${postId}/dislike`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh the feed
      fetchPosts();
    } catch (error) {
      alert('Error disliking post');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Feed - Topic: {topic}</h1>
      <div className="mb-4">
        <select
          className="border border-gray-300 p-2"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option value="tech">Tech</option>
          <option value="health">Health</option>
          <option value="politics">Politics</option>
          <option value="sport">Sport</option>
        </select>
      </div>
      {posts.map((post) => (
        <div key={post._id} className="border rounded p-2 mb-2">
          <p className="font-semibold">{post.author?.username || 'Unknown'}:</p>
          <p>{post.content}</p>
          <p className="text-sm text-gray-600">
            Likes: {post.likes.length} | Dislikes: {post.dislikes.length}
          </p>
          <button
            className="bg-blue-500 text-white px-2 py-1 mr-2"
            onClick={() => handleLike(post._id)}
          >
            Like
          </button>
          <button
            className="bg-red-500 text-white px-2 py-1"
            onClick={() => handleDislike(post._id)}
          >
            Dislike
          </button>
        </div>
      ))}
    </div>
  );
}

export default FeedPage;

