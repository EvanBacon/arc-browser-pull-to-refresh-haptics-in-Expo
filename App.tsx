import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ArcScrollView } from "./src/ArcScrollView";

export default function App() {
  const [refreshing, setRefreshing] = useState(false);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ArcScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 500);
            }}
          />
        }
        style={{
          flex: 1,
          backgroundColor: "white",
        }}
      >
        <View style={styles.container}>
          <Text style={{ fontSize: 16 }}>Pull to refresh ↓</Text>
          <StatusBar style="auto" />
        </View>
      </ArcScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
