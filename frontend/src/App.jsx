import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Signup from './components/signup'
import Login from './components/login'
import Home from './components/home'
import MainLayout from './components/mainlayout'
import Profile from './components/Profile'
import EditProfile from './components/EditProfile'
import GroupProfile from './components/GroupProfile'
import { setSocket } from './redux/socketSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { setMessages, setOnlineUsers } from './redux/chatSlice'
import { setLikeNotification } from './redux/rtnSlice'
import ProtectedRoutes from './components/ProtectedRoutes'

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element:<ProtectedRoutes><MainLayout /></ProtectedRoutes> ,
    children: [
      {
        path: '/',
        element:<ProtectedRoutes><Home /></ProtectedRoutes> 
      },
      {
        path: '/profile/:id',
        element: <ProtectedRoutes><Profile /></ProtectedRoutes>
      },
      {
        path: '/account/edit',
        element: <ProtectedRoutes><EditProfile /></ProtectedRoutes>
      },
      {
        path: '/group/profile/:id',
        element: <ProtectedRoutes><GroupProfile /></ProtectedRoutes>
      },
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  }
])

function App() {
  const { user } = useSelector(store => store.auth);
  const { socket } = useSelector(store => store.socketio);
  const dispatch = useDispatch();



  //console.log('frontend hi');
  useEffect(() => {
    if (user) {
      const socketio = io('http://localhost:8000', {
        query: {
          userId: user?._id
        },
        transports: ['websocket']
      });
      //console.log("frontend ke taraf");
      dispatch(setSocket(socketio));

      socketio.on('connect', () => {
        //console.log('Socket connected:', socketio.id);
      });

      // listen all the events
      socketio.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on('notification', (notification) => {
        dispatch(setLikeNotification(notification));
      });

      return () => {
        socketio.close();
        dispatch(setSocket(null));
      }
    } else if (socket) {
      socket.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);


  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  )
}

export default App
