import React from "react";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { getAllNotes, updateNotesFunction } from "../utils/asyncStorage";
import { generateNewId } from "../utils/generateNewId";
import { router } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';

// use Hook to listen on stated and render useEffect accordingly
export const useNotes = (id) => {
    const [notes, setNotes] = useState([]);
    const [oneNote, setOneNote] = useState({});

    useFocusEffect(
        React.useCallback(() => {
            const loadNotes = async () => {
                const loadedNotes = await getAllNotes();
                setNotes(loadedNotes);
            };
            loadNotes();
        }, [])
    );

    useEffect(() => {
        const existingNoteObject = notes.find((note) => note.id === id);
        setOneNote(existingNoteObject);
    }, [id, notes]);


    // Save note created or edited
    const handleSaveNote = async (id, title, content, color, imageUri) => {
        let oldNotesArray = notes;
        let newNotesArray;

        const existingNoteObject = oldNotesArray.find((note) => note.id === id);

        // Set new note 
        const newNote = {
            id: id ? id : generateNewId(),
            color: color,
            title: title,
            content: content,
            image: imageUri,
        };

        // Check if note exist 
        if (existingNoteObject) {
            // Replaces the note with the matching id with the new data
            newNotesArray = oldNotesArray.map((note) => (note.id === id ? newNote : note));
        } else {
            // Else, it creates a new array by spreading and adding the new note
            newNotesArray = [...oldNotesArray, newNote];
        }

        try {
            await updateNotesFunction(newNotesArray);
            setNotes(newNotesArray);
            router.back();
        } catch (error) {
            console.error("Error saving note: ", error);
        }
    };

    // Delete note functionality
    const handleDeleteNote = async (id) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this note?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            // Removes chosen note from the notes array based on id and updates array
                            const newNotesArray = notes.filter((note) => note.id !== id);
                            await updateNotesFunction(newNotesArray);
                            setNotes(newNotesArray);
                            router.back();
                        } catch (error) {
                            console.error("Error deleting note: ", error);
                        }
                    },
                    style: "destructive",
                },
            ],
            { cancelable: false }
        );
    };

    return { notes, oneNote, handleSaveNote, handleDeleteNote };
};