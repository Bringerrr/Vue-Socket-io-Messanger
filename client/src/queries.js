import { gql } from "apollo-boost";

/* Posts Queries */
export const GET_POSTS = gql`
  query {
    getPosts {
      _id
      title
      imageUrl
    }
  }
`;

/* User Queries */
export const GET_CURRENT_USER = gql`
  query {
    getCurrentUser {
      tokenExpirationTime
      user {
        _id
        username
        email
        password
        avatar
        joinDate
        favorites {
          _id
          title
          imageUrl
        }
      }
    }
  }
`;

export const GET_CURRENT_USER_CORRESPONDENCE = gql`
  query {
    getCurrentUserCorrespondence {
      _id
      messages {
        _id
        username
        message
      }
      anotheruser {
        _id
        username
        avatar
      }
    }
  }
`;
/* Chat Queries   */

export const GET_PUBLIC_CHAT_ROOMS = gql`
  query {
    getPublicChatRooms {
      _id
      title
      description
      createdBy
      private
      participants
      messages
    }
  }
`;

export const GET_PRIVATE_CHAT_ROOMS = gql`
  query {
    getPrivateChatRooms {
      _id
      title
      description
      createdBy
      private
      participants
      messages
    }
  }
`;

export const GET_CURRENT_CHAT_ROOM_MESSAGES = gql`
  query($roomId: ID!) {
    getCurrentChatRoomMessages(roomId: $roomId) {
      _id
      userid
      username
      message
      avatar
      deleted
      createdDate
    }
  }
`;

export const GET_CURRENT_USER_CORRESPONDENCE_MESSAGES = gql`
  query {
    getCurrentUserCorrespondenceMessages {
      _id
      userid
      username
      message
      deleted
      avatar
      createdDate
    }
  }
`;

/* Posts Mutations */

export const ADD_POST = gql`
  mutation(
    $title: String!
    $imageUrl: String!
    $categories: [String]!
    $description: String!
    $creatorId: ID!
  ) {
    addPost(
      title: $title
      imageUrl: $imageUrl
      categories: $categories
      description: $description
      creatorId: $creatorId
    ) {
      _id
      title
      imageUrl
      categories
      description
    }
  }
`;

/* User Mutations */
export const SIGNIN_USER = gql`
  mutation($username: String!, $password: String!) {
    signinUser(username: $username, password: $password) {
      token
    }
  }
`;

export const SIGNUP_USER = gql`
  mutation($username: String!, $email: String!, $password: String!) {
    signupUser(username: $username, email: $email, password: $password) {
      token
    }
  }
`;

export const INFINITE_SCROLL_POSTS = gql`
  query($pageNum: Int!, $pageSize: Int!) {
    infiniteScrollPosts(pageNum: $pageNum, pageSize: $pageSize) {
      hasMore
      posts {
        _id
        title
        imageUrl
        categories
        description
        likes
        createdDate
        messages {
          _id
        }
        createdBy {
          _id
          username
          avatar
        }
      }
    }
  }
`;

export const INFINITE_SCROLL_MESSAGES = gql`
  query($pageNum: Int!, $pageSize: Int!, $roomid: ID!) {
    infiniteScrollMessages(
      pageNum: $pageNum
      pageSize: $pageSize
      roomid: $roomid
    ) {
      hasMore
      messages {
        username
        message
        createdDate
        avatar
      }
    }
  }
`;

/* Chat Mutations */

export const ADD_CHAT_ROOM = gql`
  mutation(
    $userid: ID!
    $title: String!
    $description: String!
    $private: Boolean!
  ) {
    addChatRoom(
      creatorId: $userid
      title: $title
      description: $description
      private: $private
    ) {
      _id
      title
      description
      createdBy
      private
    }
  }
`;

export const SEND_CHAT_MESSAGE = gql`
  mutation(
    $private: Boolean!
    $userid: ID!
    $message: String!
    $roomId: ID!
    $username: String!
  ) {
    sendChatMessage(
      userid: $userid
      message: $message
      roomId: $roomId
      username: $username
      private: $private
    ) {
      userid
      username
      message
      avatar
      private
      createdDate
    }
  }
`;

export const SEND_PRIVATE_CHAT_MESSAGE = gql`
  mutation(
    $private: Boolean!
    $userid: ID!
    $anotheruserid: ID
    $message: String!
    $roomId: ID!
    $username: String!
  ) {
    sendPrivateMessage(
      userid: $userid
      message: $message
      roomId: $roomId
      username: $username
      private: $private
      anotheruserid: $anotheruserid
    ) {
      userid
      username
      message
      private
      createdDate
      avatar
    }
  }
`;
