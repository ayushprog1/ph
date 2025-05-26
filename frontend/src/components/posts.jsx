import React from 'react'
import Post from './Post'
import { useSelector } from 'react-redux'
import { useOutletContext } from 'react-router-dom';

const Posts = () => {
  const {posts} = useSelector(store => store.posts);
  const { dark } = useOutletContext();
  return (
    <div >
        {/*
            //[1,2,34,4].map((item,index)=> <Post key={index}/>)
            posts.map((post)=><Post key={post._id} post={post}/>)*/
        }
        {posts.length > 0 ? (
        posts.map((post) => <Post key={post._id} post={post} />)
      ) : (
        <div className={`flex flex-col justify-center text-center  text-lg h-screen ${dark ? 'bg-[#1E1E2E] text-[#c7cac7c8]' : ''}`}>
          <p>No pics yet.</p>
          <p className="mt-2">Be the first to <span className={`font-semibold ${dark ? 'text-[#bd8cee]' : ''}`}>create a pic</span>!</p>
        </div>
      )}
    </div>
  )
}

export default Posts