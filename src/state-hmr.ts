import axios from "axios";
import type { PostDTO } from "./types/posts.dto";

export async function fetchPosts(): Promise<PostDTO[] | null> {
    const fetchPosts = await axios.get<PostDTO[]>(import.meta.env.VITE_POSTS_API);
    if(fetchPosts.status === 200) {
        return fetchPosts?.data;
    } else {
        return null;
    }
}

export async function onPostsData(id: number): Promise<void> {
    const fetchPosts = await axios.get<PostDTO[]>(import.meta.env.VITE_POSTS_API);
    fetchPosts.data.forEach((post) => {
        if(post.id === id) {
            console.log(post);
        }
    });
}

export function setLocalStorage(listPost: PostDTO[]): void {
    localStorage.setItem("post-list", JSON.stringify(listPost));
}

export async function searchSomePosts(search: number): Promise<void> {
    if(search !== null) {
        const fetchPosts = await axios.get<PostDTO[]>(import.meta.env.VITE_POSTS_API);
        fetchPosts.data.forEach((post) => {
            if(search === post.id) {
                localStorage.setItem("search-post", JSON.stringify(post));
            }
        });
    }

    return JSON.parse(localStorage.getItem("search-post") || "[]");
}

const intervalId = setInterval(() => {
    console.log("Start clean process");
    const dataSearched = JSON.parse(localStorage.getItem("search-post") || "[]");
    
    if (dataSearched) {
      localStorage.removeItem("posts-list");
      localStorage.setItem("posts-list", JSON.stringify(dataSearched));
    }

    console.log("End clean process");
}, 5000);

if(import.meta.hot) {
    import.meta.hot.dispose(() => {
        console.log("Cleaning before state");
        
        clearInterval(intervalId);
    });

    import.meta.hot.accept(() => {
        console.log("Estado módulooo atualizado");
    });
}