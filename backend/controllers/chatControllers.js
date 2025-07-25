const asyncHandler = require("express-async-handler");
const { Chat } = require("../models/chatModels");
const { User } = require("../models/userModel");

const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    let isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate("users", "-password")
        .populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    });

    if (isChat.length > 0) {
        return res.send(isChat[0]);
    }

    const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
    };

    try {
        const createdChat = await Chat.create(chatData);
        const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
            "users",
            "-password"
        );
        res.status(200).send(fullChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    let results = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    results = await Chat.populate(results, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).send(results);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please fill all the fields" });
    }
    let users = JSON.parse(req.body.users);
    if (users.length < 2) {
        return res.status(400).send("More than 2 users are required to form a group chat");
    }
    users.push(req.user);
    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user._id,

        });
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});


const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;  
    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName: chatName },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");   
    if (!updatedChat) {
        res.status(404);
        throw new Error("Chat not found");
    } else {
        res.json(updatedChat);
    }   
});

const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const removedUser = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId },
        },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    if (!removedUser) {
        res.status(404);
        throw new Error("Chat not found");
    }
    return res.json(removedUser);

});

const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const addedUser = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId },
        },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    if (!addedUser) {
        res.status(404);
        throw new Error("Chat not found");
    }
    return res.json(addedUser);
});
module.exports = { accessChat, fetchChats, createGroupChat , renameGroup, removeFromGroup ,addToGroup};