import { useEffect, useState } from "react";
import { fetchPosts, searchSomePosts, setLocalStorage } from "./state-hmr";
import "./App.css";
import type { PostDTO } from "./types/posts.dto";

function App() {
  const [postsList, setPostsList] = useState<PostDTO[]>([]);
  const [search, setSearch] = useState<number | null>(null);

  useEffect(() => {
    fetchPosts().then((posts) => {
      setPostsList(posts || []);
      setLocalStorage(posts || []);
    });
  }, []);

  return (
    <section>
      <form className="form-center">
        <input 
          type="number" 
          placeholder="Search posts..." 
          onChange={(e) => setSearch(Number(e.target.value))}
        />
        <button 
          type="submit"
          onClick={(e) => { 
            e.preventDefault();
            searchSomePosts(search || 0);
            e.stopPropagation();  
          }}
          >
            Search
        </button>
      </form>
      <ul className="list-flex">
        {postsList.map((post) => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default App;
