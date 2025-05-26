import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Group } from "../models/group.model.js";
import { Post } from "../models/post.model.js";
import { v4 as uuidv4 } from 'uuid';

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(401).json({
                message: "something is missing,please check!",
                success: false,
            });
        }
        const existinguser = await User.findOne({ email });
        if (existinguser) {
            return res.status(401).json({
                message: "try other email",
                success: false,
            });
        }

        const hashedpassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedpassword
        })
        return res.status(201).json({
            message: "Account created successfuly",
            success: true,
        });


    } catch (error) {
        console.log(error);
    }
}

export const login = async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(401).json({
                message: "something is missing,please check!",
                success: false,
            });
        }

        const existinguser = await User.findOne({ email });
        if (!existinguser) {
            return res.status(401).json({
                message: "Incorrect email or password",
                succcess: false,
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, existinguser.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        };

        //populate each post if in a post array
        const populatedposts = await Promise.all(
            existinguser.posts.map(async (postId) => {
                const post = await Post.findById(postId);
                if (post && post.author.equals(existinguser._id)) {
                    return post;
                }
                return null;
            })
        )

        const userData = {
            _id: existinguser._id,
            username: existinguser.username,
            email: existinguser.email,
            profilepicture: existinguser.profilepicture,
            about: existinguser.about,
            place: existinguser.place,
            gender: existinguser.gender,
            friends: existinguser.friends,
            friendRequests: existinguser.friendRequests,
            groups: existinguser.groups,
            posts: populatedposts,
        }

        const token = await jwt.sign({ userId: existinguser._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `welcome back ${existinguser.username}`,
            success: true,
            userData
        });

    } catch (error) {
        console.log(error);
    }
};

export const logout = async (_, res) => {
    try {
        return res.cookie('token', "", { maxAge: 0 }).json({
            message: 'log out successfully.',
            success: true
        });
    } catch (error) {
        console.log(error);

    }
};

export const getprofile = async (req, res) => {
    try {
        const loguser =req.id;
        const userId = req.params.id;
        let mainuser = await User.findById(loguser)/*.populate({path:'posts',createdAt:-1})*/.select('-password');
        let user = await User.findById(userId)/*.populate({path:'posts',createdAt:-1})*/.select('-password');
        return res.status(200).json({
            user,
            mainuser,
            success: true
        });

    } catch (error) {
        console.log(error);

    }
};

export const editprofile = async (req, res) => {
    try {
        const userId = req.id;
        const { about, gender, place } = req.body;
        const profilepicture = req.file;
        let cloudResponse;

        if (profilepicture) {
            const fileUri = getDataUri(profilepicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'user not found',
                success: false
            })
        };

        if (about) user.about = about;
        if (gender) user.gender = gender;
        if (place) user.place = place;
        if (profilepicture) user.profilepicture = cloudResponse.secure_url;

        if (place) {
            try {
                user.place = JSON.parse(place); // parse the JSON stringified array from frontend
                if (!Array.isArray(user.place)) {
                    return res.status(400).json({ message: 'Place must be an array', success: false });
                }
            } catch (err) {
                return res.status(400).json({ message: 'Invalid place format', success: false });
            }
        }

        await user.save();
        return res.status(200).json({
            message: 'profile updated successfully',
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
    }
};

export const getAllUser = async (req, res) => {
    try {
        const AllUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!AllUsers) {
            return res.status(400).json({
                message: 'currently no user find'
            })
        };
        return res.status(200).json({
            success: true,
            users: AllUsers
        })
    } catch (error) {
        console.log(error);
    }
};

export const createGroup = async (req, res) => {
    try {
        const userId = req.id;
        const { Name, people } = req.body;
        //console.log(Name);

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'user not found',
                success: false
            })
        };

        if (!Name) {
            return res.status(401).json({
                message: "Name is missing,please check!",
                success: false,
            });
        }

        const existgroupname = await Group.findOne({ Name });
        if (existgroupname) {
            return res.status(401).json({
                message: "try other username",
                success: false,
            });
        }

        const joinToken = uuidv4();

        const newGroup = await Group.create({
            Name,
            people,
            joinToken,
        })

        await User.updateMany(
            { _id: { $in: people } },
            { $addToSet: { groups: newGroup._id } }
        );

        return res.status(201).json({
            message: "Group created successfuly",
            success: true,
            groupid: newGroup._id,
            joinToken: newGroup.joinToken,
        });

    } catch (error) {
        console.log(error);
    }
};

export const addTokensToAllOldGroups = async (req, res) => {
  try {
    // Find all groups where joinToken is missing or null
    const groupsWithoutToken = await Group.find({ $or: [{ joinToken: { $exists: false } }, { joinToken: null }] });

    if (groupsWithoutToken.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All groups already have join tokens',
      });
    }

    // For each group, generate and assign a joinToken
    const updates = groupsWithoutToken.map(async (group) => {
      group.joinToken = uuidv4();
      return group.save();
    });

    await Promise.all(updates);

    return res.status(200).json({
      success: true,
      message: `${groupsWithoutToken.length} group(s) updated with join tokens`,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding tokens',
    });
  }
};

export const editGroupProfile = async (req, res) => {
  try {
    const userId = req.id; // from auth middleware
    const groupId = req.params.id;
    const profilepicture = req.file;
    let cloudResponse;

    // Upload new profile picture if provided
    if (profilepicture) {
      const fileUri = getDataUri(profilepicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    // Fetch group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Only allow group members or admins to update
    const isMember = group.people.some(
      (member) => member.toString() === userId
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this group',
      });
    }
    //console.log(cloudResponse,profilepicture);
    // Update profile picture
    if (profilepicture) {
      group.groupprofilepicture = cloudResponse.secure_url;
    }

    await group.save();
    return res.status(200).json({
      success: true,
      message: 'Group profile updated successfully',
      group,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};



export const getGroups = async (req, res) => {
    try {
        const user = await User.findById(req.id).select('groups');
        if (!user) {
            return res.status(404).json({
                message: 'User  not found'
            });
        }

        const userGroupIds = user?.groups;

        const userGroups = await Group.find({
            _id: { $in: userGroupIds }
        }).select('Name groupprofilepicture');

        if (userGroups.length === 0) {
            return res.status(400).json({
                message: 'Currently no groups found'
            });
        }

        return res.status(200).json({
            success: true,
            groups: userGroups
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'An error occurred while fetching groups',
            error: error.message
        });
    }
};

export const getGroupById = async (req, res) => {
  try {
    const userId = req.id; // Assuming user ID is stored in req.id by your auth middleware
    const groupId = req.params.id;

    //console.log(groupId);
    // Find the group by ID and populate people (members) if you want
    const group = await Group.findById(groupId).select('Name people groupprofilepicture joinToken posts')
  .populate({
    path: 'people',
    select: '_id username profilepicture',
  });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if user is part of this group
    const isMember = group.people.some(member => member._id.toString() === userId);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this group.',
      });
    }

    // If user is a member, send group details
    return res.status(200).json({
      success: true,
      group,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const joinGroupByToken = async (req, res) => {
    try {
        const userId = req.id; // authenticated user
        const { token } = req.params;

        // Find group by token
        const group = await Group.findOne({ joinToken: token });
        if (!group) {
            return res.status(404).json({
                message: "Invalid or expired group link.",
                success: false
            });
        }

        // Check if already a member
        if (group.people.includes(userId)) {
            return res.status(400).json({
                message: "You are already a member of this group.",
                success: false
            });
        }

        // Add user to group
        group.people.push(userId);
        await group.save();

        // Add group to user's groups
        await User.findByIdAndUpdate(userId, {
            $addToSet: { groups: group._id }
        });

        return res.status(200).json({
            message: "You have joined the group successfully.",
            success: true,
            groupId: group._id
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};



export const friendornot = async (req, res) => {
    try {
        const followkarnewala = req.id; //patel
        const jiskofollowkarunga = req.params.id; //shivani
        if (followkarnewala === jiskofollowkarunga) {
            return res.status(400).json({
                message: 'cannot follow yourself',
                success: false
            });
        }

        const user = await User.findById(followkarnewala);
        const targetUser = await User.findById(jiskofollowkarunga);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: 'user not found',
                success: false
            });
        }

        //mai check karunga follow karna ya unfollow
        const isFollowing = user.friends.includes(jiskofollowkarunga);
        if (isFollowing) {
            //unfollow
            await Promise.all([
                User.updateOne({ _id: followkarnewala }, { $pull: { friends: jiskofollowkarunga } }),
                User.updateOne({ _id: jiskofollowkarunga }, { $pull: { friends: followkarnewala } }),
            ])
            return res.status(200).json({ message: 'remove friend successfully', success: true });

        } else {
            //follow
            await Promise.all([
                User.updateOne({ _id: followkarnewala }, { $push: { friends: jiskofollowkarunga } }),
                User.updateOne({ _id: jiskofollowkarunga }, { $push: { friends: followkarnewala } }),
            ])
            return res.status(200).json({ message: 'friend added successfully', success: true });
        }

    } catch (error) {
        console.log(error);

    }
};

export const sendFriendRequest = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        if (senderId === receiverId) {
            return res.status(400).json({ message: "Cannot send request to yourself", success: false });
        }

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        // if (receiver.friendRequests.includes(senderId)) {
        //     return res.status(400).json({ message: "Friend request already sent", success: false });
        // }

        if (receiver.friends.includes(senderId)) {
            return res.status(400).json({ message: "User is already your friend", success: false });
        }

        if (receiver.friendRequests.includes(senderId)) {
            receiver.friendRequests = receiver.friendRequests.filter(
                id => id.toString() !== senderId
            );
            await receiver.save();
            return res.status(200).json({ message: "Friend request canceled",receiver, success: true });
        } else {
            receiver.friendRequests.push(senderId);
            await receiver.save();
            return res.status(200).json({ message: "Friend request sent",receiver, success: true });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const acceptFriendRequest = async (req, res) => {
    try {
        const receiverId = req.id; // Logged-in user accepting the request
        const senderId = req.params.id;

        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);

        if (!receiver || !sender) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const hasRequest = receiver.friendRequests.includes(senderId);
        if (!hasRequest) {
            return res.status(400).json({ message: "No friend request to accept", success: false });
        }

        // Remove from requests and add to friends
        receiver.friendRequests = receiver.friendRequests.filter(
            id => id.toString() !== senderId
        );

        receiver.friends.push(senderId);
        sender.friends.push(receiverId);

        await Promise.all([receiver.save(), sender.save()]);

        return res.status(200).json({ message: "Friend request accepted", receiver, sender, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const removeFriend = async (req, res) => {
    try {
        const userId = req.id; // Logged-in user
        const friendId = req.params.id; // Friend to remove

        if (userId === friendId) {
            return res.status(400).json({ message: "Cannot remove yourself", success: false });
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const alreadyFriends = user.friends.includes(friendId);
        if (!alreadyFriends) {
            return res.status(400).json({ message: "You are not friends", success: false });
        }

        // Remove each other from friends lists
        user.friends = user.friends.filter(id => id.toString() !== friendId);
        friend.friends = friend.friends.filter(id => id.toString() !== userId);

        await Promise.all([user.save(), friend.save()]);

        return res.status(200).json({ message: "Friend removed successfully", user, friend, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};


