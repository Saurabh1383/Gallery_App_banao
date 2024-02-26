import * as React from 'react';
import { StyleSheet,View, Text, ScrollView,Image,Modal,TouchableOpacity ,Pressable, RefreshControl} from 'react-native';
import { useNetInfo } from "@react-native-community/netinfo";
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const HomePage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentImage,setCurrent]=useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page,setPage]=useState(1);
  const[last,setLast]=useState(false);
  const netInfo = useNetInfo();
   
  const fetchData = async () => {
    if(!netInfo.isConnected)
    return;
    try {
      setLoading(true);
      const response = await axios.get('https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&per_page=20&page=1&api_key=6f102c62f41998d151e5a1b48713cf13&format=json&nojsoncallback=1&extras=url_s');
     
      setData(response.data.photos.photo);

      await AsyncStorage.clear();
      // Store the fetched data in AsyncStorage
      await AsyncStorage.setItem('data', JSON.stringify(response.data.photos.photo));
      
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const onRefresh = async() => {
    setRefreshing(true);
   await fetchData();
    setRefreshing(false);
  }

  useEffect(()=>
  {
    if(netInfo.isConnected)
    fetchData();
  },[page]);

  const getOfflineData = async () => {
    try {
      const offlineData = await AsyncStorage.getItem('data');
      if (offlineData) {
        console.log('Offline data found:', JSON.parse(offlineData));
        setData(JSON.parse(offlineData));
      } else {
        console.log('No offline data found.');
        setData([]); // Set an empty array or handle this case as needed
      }
    } catch (error) {
      console.error('Error retrieving offline data:', error);
    }
  };
  const nextPage=()=>
  {
    if(page<50){
      const next=page+1;
    setPage(next);
    }
  }

  if (!netInfo.isConnected) {
 
 
   getOfflineData();

  }
  useEffect(() => {
    if (netInfo.isConnected) {
      onRefresh();
    }
  }, [netInfo.isConnected]);
 
 if(data.length==0)
   {
    return(<Text>No content to display ...</Text>)
   }

  return (  
     loading?(<View style={styles.LoadContainer}><Image source={{uri:'https://www.icegif.com/wp-content/uploads/2023/07/icegif-1263.gif'}} style={styles.image}></Image></View>):(  
      <View>
       {!netInfo.isConnected?(<Text style={{color:'white',backgroundColor:'black'}}>Currently Offline</Text>):(<Text style={{color:'white',backgroundColor:'green'}}>Online</Text>)}
       {currentImage&&
       <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>

          <Image source={{ uri:currentImage.url_s }} style={styles.modalImage} />

          <View style={styles.detailsContainer}>
            <Text>ID: {currentImage.id}</Text>
            <Text>Title: {currentImage.title}</Text>
            <Text>Owner: {currentImage.owner}</Text>
          </View>
        </View>
      </Modal>
     }
      {data&&<ScrollView contentContainerStyle={styles.scrollViewContainer} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }> 
      {data.map((item, index) => (
        <TouchableOpacity key={index} onPress={() => {setCurrent(item);setModalVisible(true)}} style={styles.column}>
           <View key={index}>
          <Image source={{ uri: item.url_s }} style={styles.image} />
        </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
    
     }
       
    
    </View>
     )
    
    
  );
};
const styles = StyleSheet.create({
  scrollViewContainer: {
    flexDirection: 'row', // Use row direction for columns
    flexWrap: 'wrap', // Wrap content to the next row when it exceeds the screen width
  },
  column: {
    width: '50%', // Set each column to take 50% of the screen width
    padding: 8,
  },
  image: {
    width: '100%', // Make the image take the full width of the column
    height: 200, // Adjust the height as needed
    resizeMode: 'cover', // Adjust the resizeMode as needed
    borderRadius: 8, // Optional: Add borderRadius for a rounded appearance
  },
  LoadContainer:{
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  modalContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalImage: {
    width: '80%',
    height: 300,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  detailsContainer: {
    width:'80%',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop:3,
   
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default HomePage;
