import React, { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label";
import { toast } from "sonner";
import axios from "axios";
import { Link, useNavigate} from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

const Signup = () => {
    const [input, setInput] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();
    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }
    const signupHandler = async (e) => {
        e.preventDefault();
        console.log(input);
        try {
            setLoading(true);
            const res = await axios.post('https://phshare.onrender.com/api/v1/user/register', input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message);
                setInput({
                    username: "",
                    email: "",
                    password: ""
                });
            }
        } catch (error) {
            console.log(error);
            if (error.response) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Error: ' + error.message);
            }
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [])


    return (
        <div className='flex items-center w-screen h-screen justify-center '>
            <form onSubmit={signupHandler} className='shadow-lg flex flex-col gap-5 p-8'>
                <div className='my-4'>
                    <h1 className="font-bold text-center text-xl">ph</h1>
                    <p className="text-sm text-center">SignUp to get new social experience with your friends</p>
                </div>
                <div>
                    <Label className="py-4 font-medium ">UserName</Label>
                    <Input
                        type="text"
                        name="username"
                        value={input.username}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent"
                    />
                </div>
                <div>
                    <Label className="py-4 font-medium ">email</Label>
                    <Input
                        type="email"
                        name="email"
                        value={input.email}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent"
                    />
                </div>
                <div>
                    <Label className="py-4 font-medium ">Password</Label>
                    <Input
                        type="password"
                        name="password"
                        value={input.password}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent"
                    />
                </div>
                {
                    loading ? (
                        <Button>
                            <Loader2 className="mr-2 h-4 w-4 animation-spin" />
                            Please wait
                        </Button>
                    ) : (
                        <Button type='submit'>Signup</Button>
                    )
                }
                <span className="text-center">Already have an account? <Link to="/login" className="text-blue-600">Login</Link></span>
                
            </form>

        </div>
    )
}

export default Signup