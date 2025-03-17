import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { 
    View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity 
} from 'react-native';
import Button from '@/components/buttons/Button';
import InputField from '@/components/inputs/InputField';
import TagSelector from '@/components/inputs/TagSelector';
import { router } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { attachments, cross } from '@/assets/icons';

const PostFormScreen = () => {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
        })();
    }, []);

    const handleClose = () => {
        router.push('/map');
    };

    const handleSubmit = () => {
        console.log({ title, description, tags, latitude: location?.latitude, longitude: location?.longitude });
        handleClose();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.top}>
                <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 8 }}>
                    <TouchableOpacity onPress={handleClose} testID='close-button'>
                        <SvgXml xml={cross} width={24} height={24} />
                    </TouchableOpacity>
                    <Text style={styles.header}>New Report</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 8 }}>
                    <Button children="Post" onPress={handleSubmit} />
                </View>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.inputSection}>
                    <Text style={styles.label}>Location</Text>
                    <Text style={styles.paragraph}>
                        Latitude: {location?.latitude ?? 'Fetching...'}
                    </Text>
                    <Text style={styles.paragraph}>
                        Longitude: {location?.longitude ?? 'Fetching...'}
                    </Text>
                </View>

                <View style={styles.inputSection}>
                    <InputField label="Title" placeholder="Enter title" labelColor='#904a47' onChangeText={setTitle}/>
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.label}>Tags</Text>
                    <TagSelector selectedTags={tags} onTagChange={setTags} />
                </View>

                <View style={styles.inputSection}>
                    <InputField label="Description" placeholder="Enter description" multiline labelColor='#904a47' onChangeText={setDescription}/>
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.label}>Attachments</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 8 }}>
                        <SvgXml xml={attachments} width={12} height={12} style={{ marginRight: 8 }} />
                        <Text style={styles.paragraph}>Add attachments.</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 8,
        marginHorizontal: 8,
    },
    scroll: {
        marginHorizontal: 8,
    },
    top: {
        marginVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#3b080a",
        marginLeft: 8,
    },
    label: {
        marginBottom: 6,
        fontSize: 16,
        fontWeight: "bold",
        color: "#904a47",
    },
    paragraph: {
        color: "#904a47",
    },
    inputSection: {
        marginBottom: 12,
        width: "100%",
    },
});

export default PostFormScreen;
