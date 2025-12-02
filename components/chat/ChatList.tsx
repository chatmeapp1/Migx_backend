
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ChatItem } from './ChatItem';

const chatData = [
  {
    type: 'user' as const,
    name: 'f1yingkit3',
    message: 'Hi there! Want to play some games together',
    time: '11:3',
    isOnline: true,
  },
  {
    type: 'room' as const,
    name: 'Fashion Show',
  },
  {
    type: 'room' as const,
    name: 'Game Lobby',
    message: '[PVT] Play now: !start to enter. ...',
    time: '11:3',
  },
  {
    type: 'user' as const,
    name: 't00fi3',
    message: '@f1yingkit3 Haha! Yup!',
    isOnline: true,
  },
  {
    type: 'user' as const,
    name: 'f1yingkit3',
    message: '"Flight of the Valkyries" is always used as ...',
    isOnline: true,
  },
  {
    type: 'user' as const,
    name: 'b4sejump',
    message: 'Reply: LOL! Silly kitty doesn\'t know that it ...',
    tags: ['A', 'M'],
  },
  {
    type: 'user' as const,
    name: 'b4sejump',
    message: 'Definitely! 100%!',
    tags: ['A', 'M'],
  },
];

export function ChatList() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {chatData.map((chat, index) => (
          <ChatItem key={index} {...chat} />
        ))}
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  spacer: {
    height: 20,
  },
});
