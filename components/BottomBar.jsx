import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import colours from '../assets/colours/colours';
import Feather from "react-native-vector-icons/Feather";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Homepage from './Homepage';
import AddActivityButton from './AddActivityButton';
import React, { useState, useCallback, useEffect } from "react"
import { Alert, Image, View, Text } from 'react-native';
import { supabase } from '../lib/supabase';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import Style from "./Style";
import { useDispatch, useSelector } from 'react-redux';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error;
    } else {
      navigation.navigate('Launchpage');
    }
  } catch (error) {
    console.log(error);
  }
}

function CustomDrawerContent(props) {
  const dispatch = useDispatch();
  const { name } = useSelector((state) => state.profile);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[Style.header, { backgroundColor: colours.tab }]}>
        <Text style={[{ color: colours.text, marginLeft: 17, fontSize: 20 }]}>Hi, {name}</Text>
      </View>
      <DrawerContentScrollView {...props}>
        <DrawerItem
          label="Sign Out"
          onPress={() => signOut()}
          labelStyle={{
            color: colours.text
          }}
        />
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </SafeAreaView>
  );
}

function HomepageDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props}
      />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: colours.background
        },
      }}>
      <Drawer.Screen
        name="Homepage"
        component={Homepage}
        options={{
          headerShown: false,
          drawerItemStyle: { height: 0 }
        }} />
    </Drawer.Navigator >
  );
}

export default function BottomBar({ session, navigation }) {

  const [appIsReady, setAppIsReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        const user = supabase.auth.user();
        if (!user) throw new Error("No user on the session!");

        let { data, error, status } = await supabase
          .from("profiles")
          .select(`profileSetup`)
          .eq("id", user.id)
          .single();
        if (error && status !== 406) {
          throw error;
        }

        if (data) {
          //Redirect users to setup profile page if profile has not been setup
          if (!data.profileSetup) {
            navigation.navigate('SetupProfile');
          }
        }
      } catch (error) {
        Alert.alert((error).message);
      } finally {
        setLoading(false);
      }
    }

    //Get saved profile details
    getProfile();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colours.background,
          display: "flex"
        },
      }}>

      <Tab.Screen
        name="Leaderboard"
        component={HomepageDrawer}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../assets/images/Leaderboard.png")}
              style={{ width: 30, height: 30, marginTop: 10 }}
              color={colours.text}
            />
          )
        }}
        session={session}
      />
      
      <Tab.Screen
        name="Calories"
        component={HomepageDrawer}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../assets/images/Calorie.png")}
              style={{ width: 23, height: 23, resizeMode: 'contain' }}
              color={colours.text}
            />
          )
        }} />

      <Tab.Screen
        name="Add Activity"
        component={HomepageDrawer}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <AddActivityButton navigation={navigation} />
          )
        }} />

      <Tab.Screen
        name="Exercise"
        component={HomepageDrawer}
        options={{
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name="dumbbell"
              size={20}
              color={colours.text}
            />
          )
        }} />

      <Tab.Screen
        name="Target"
        component={HomepageDrawer}
        options={{
          tabBarIcon: ({ focused }) => (
            <Feather
              name="target"
              size={25}
              color={colours.text}
            />
          )
        }} />
    </Tab.Navigator>
  );
}
