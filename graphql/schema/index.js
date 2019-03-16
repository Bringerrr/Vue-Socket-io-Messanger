const { buildSchema } = require("graphql");

module.exports = buildSchema(`
  type User {
    _id: ID
    username: String! @unique
    email: String!
    password: String!
    avatar: String
    joinDate: String
    favorites: [Post]
    correspondence: [Correspondence]
  }
  
  type Post {
    _id: ID
    title: String!
    imageUrl: String!
    categories: [String]!
    description: String!
    createdDate: String
    likes: Int
    createdBy: User!
    messages: [Message]
  }
  
  type Message {
    _id: ID
    messageBody: String!
    messageDate: String
    messageUser: User!
  }

  type Correspondence{
    _id: ID
    messages: [ChatMessage]
    participants: [User]
    anotheruser: User
  }
  
  type Token {
    token: String!
  }

  type ChatMessage {
    _id: ID!
    userid: ID!
    username: String!
    avatar: String
    message: String!
    deleted: Boolean!
    private: Boolean!
    createdDate: String!
  }
  
  type ChatRoom {
    _id: ID
    title: String!
    description: String!
    createdBy: ID!
    private: Boolean!
    participants: [ID]
    messages: [ID]
  }

  type PostPage{
    posts: [Post]
    hasMore: Boolean
  }

  type ChatPage{
    messages : [ChatMessage]
    hasMore: Boolean
  }

  type Query {
    getCurrentUser: User
    getCurrentUserCorrespondence: [Correspondence]
    getCurrentUserCorrespondenceMessages: [ChatMessage]
    getPosts: [Post]
    infiniteScrollPosts(pageNum: Int!, pageSize: Int!): PostPage
    getPublicChatRooms: [ChatRoom]
    getCurrentChatRoomMessages(roomId:ID!): [ChatMessage]
    infiniteScrollMessages(pageNum: Int!, pageSize: Int!, roomid: ID!): ChatPage
  }
  
  type Mutation {
    addPost(
      title: String!
      imageUrl: String!
      categories: [String]!
      description: String!
      creatorId: ID!
    ): Post!
    sendChatMessage(userid: ID!, anotheruserid: ID, roomId:ID!, username: String!, avatar: String, message: String!, private: Boolean!): ChatMessage
    sendPrivateMessage(userid: ID!, anotheruserid: ID, roomId:ID!, username: String!, avatar: String, message: String!, private: Boolean!): ChatMessage
    addPublicChatRoom(
      private: Boolean!
      creatorId: ID!
      description: String!
      title: String!
    ): ChatRoom
    signinUser(username: String!, password: String!): Token
    signupUser(username: String!, email: String!, password: String!): Token
  }
`);
