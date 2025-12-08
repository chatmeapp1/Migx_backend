
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useThemeCustom } from '@/theme/provider';
import { EditProfileHeader } from '@/components/profile/EditProfileHeader';
import { EditProfileStats } from '@/components/profile/EditProfileStats';
import { getStoredUser } from '@/utils/storage';
import { API_ENDPOINTS } from '@/utils/api';

export default function EditProfileScreen() {
  const { theme } = useThemeCustom();
  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const userData = await getStoredUser();
    if (userData) {
      setUser(userData);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleBackgroundPress = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      console.log('Background photo selected:', result.assets[0].uri);
      // TODO: Upload background photo
    }
  };

  const handleAvatarPress = async () => {
    if (!user) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setUploading(true);

      // Create form data
      const formData = new FormData();
      formData.append('userId', user.id);
      
      // Get file extension
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      formData.append('avatar', {
        uri,
        name: `avatar.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      // Upload
      const response = await fetch(API_ENDPOINTS.PROFILE.AVATAR_UPLOAD, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Success', 'Avatar uploaded successfully');
        
        // Update user data
        const updatedUser = { ...user, avatar: data.avatar };
        setUser(updatedUser);
        
        // Update stored user
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        Alert.alert('Error', data.error || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Error', 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handlePostPress = () => {
    console.log('View posts');
  };

  const handleGiftPress = () => {
    console.log('View gifts');
  };

  const handleFollowersPress = () => {
    console.log('View followers');
  };

  const handleFollowingPress = () => {
    console.log('View following');
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={false}
      onRequestClose={handleBackPress}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <EditProfileHeader
            username="migX"
            level={1}
            websiteUrl="migx"
            userId="0"
            onBackPress={handleBackPress}
            onBackgroundPress={handleBackgroundPress}
            onAvatarPress={handleAvatarPress}
          />

          {user && (
            <EditProfileStats
              userId={user.id}
              onPostPress={handlePostPress}
              onGiftPress={handleGiftPress}
              onFollowersPress={handleFollowersPress}
              onFollowingPress={handleFollowingPress}
            />
          )}
          
          {uploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          )}

          {/* Add more profile content here */}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
