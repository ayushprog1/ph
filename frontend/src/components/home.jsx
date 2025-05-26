import React from 'react'
import { Outlet, useOutletContext } from 'react-router-dom';
import Feed from './feed';
import Chat from './Chat';

const Home = () => {
  const { isMobile, showChat } = useOutletContext();

  return (
    <><style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
      <div className={`flex flex-grow ${isMobile? 'h-[calc(100vh-70px)]' : 'h-screen'} `} >
        {isMobile ? ( // Only show Feed or Chat on mobile
          showChat ? <div className='flex-grow'>
            <Chat />
          </div> : <div className='flex-grow'>
            <Feed />
            <Outlet />
          </div>
        ) : (
          // Render both Feed and Chat on larger screens
          <>
            <div className='flex-1 overflow-y-auto h-full scrollbar-hide'>
              <Feed />
              <Outlet />
            </div>
            <div className='flex-1 overflow-y-auto h-full scrollbar-hide'>
              <Chat />
            </div>
          </>
        )}
      </div>
    </>

  )
}


export default Home