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
  
  type Token {
    token: String!
  }

  type ChatMessage {
    _id: ID!
    userid: ID!
    username: String!
    message: String!
    deleted: Boolean!
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

  type Query {
    getCurrentUser: User
    getPosts: [Post]
    getPublicChatRooms: [ChatRoom]
    getCurrentChatRoomMessages(roomId:ID!): [ChatMessage]
  }
  
  type Mutation {
    addPost(
      title: String!
      imageUrl: String!
      categories: [String]!
      description: String!
      creatorId: ID!
    ): Post!
    sendChatMessage(userid: ID!, roomId:ID!, username: String!, message: String!): ChatMessage
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
