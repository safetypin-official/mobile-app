import SearchBarFilter from "@/components/inputs/SearchBarFilter";
import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";

export default function SearchPage() {
    return (
        <SafeAreaView style={styles.safeArea} testID="search-page-safeAreaView">
            <View style={styles.container} testID="search-page">
                <SearchBarFilter />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: "#ffffff",
        flex: 1,
    },
    container: {
        marginTop: "4%",
        justifyContent: "center",
        alignItems: "center",
    },    
});