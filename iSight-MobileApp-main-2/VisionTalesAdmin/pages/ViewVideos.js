import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, Text, View, SafeAreaView, Alert } from 'react-native';
import MainText from './components/MainText';
import * as SQLite from 'expo-sqlite';
import YoutubePlayer from 'react-native-youtube-iframe';
import NavButton from './components/NavButton';
import ViewQuiz from './ViewQuiz';
import Quiz from './components/QuizQuestion';

var db = SQLite.openDatabase("VisionTalesDB.db");

const ViewVideos = ({ route, navigation }) => {
  
  const topic = route.params.topic;
  // const yt_id = route.params.yt_id;
  // const title = route.params.title;
  let [flatListItems, setFlatListItems] = useState([]);
  let questions = [];
  let choices = [];
  let correct = [];

  async function getQuiz(yt_id) {
    try {
      const response = await fetch(
        `https://2jwoowlka2.execute-api.us-east-1.amazonaws.com/videos/${yt_id}`
      );
      const json = await response.json();
      const videoQuiz = json.Item;

      questions = videoQuiz.quiz.questions;
      choices = videoQuiz.quiz.choices;
      correct = videoQuiz.quiz.correct;

      console.log("made call in View Video Quiz: ", questions.length);
    } catch (error) {
      console.log(error);
    }
  }

  async function takeQuiz(e, yt_id) {
    if (e === "ended") {
      await getQuiz(yt_id);
      if (questions.length > 0) {
	Alert.alert("Quiz time! Please take the quiz.");
        navigation.navigate("ViewQuiz", {
          id: yt_id,
          questions: questions,
          choices: choices,
          correct: correct,
        });
      }
    }
  }

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM table_video WHERE topic=?",
        [topic],
        (tx, results) => {
          console.log("Results: ", results.rows);
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i)
            temp.push(results.rows.item(i));
          console.log(temp);
          setFlatListItems(temp);
        },
        (tx, errors) => {
          console.log(errors);
        }
      );
    });
  }, []);

  let listViewItemSeparator = () => {
    return (
      <View
        style={{
          height: 0.2,
          width: "100%",
          backgroundColor: "#808080",
        }}
      />
    );
  };

  let listItemView = (item) => {
    console.log(item.video_id);
    return (
      <View
        key={item.video_id}
        style={{ backgroundColor: "#dbb42b", padding: 20 }}
      >
	<MainText text={item.title} />
        <YoutubePlayer 
	  height={300} 
	  play={false} 
	  videoId={item.yt_id}
	  onChangeState={e => takeQuiz(e, item.yt_id)}
	/>
        <NavButton
          title="Edit Video"
          customClick={() =>
            navigation.navigate("EditVideo", {
              video_id: item.video_id,
              title: item.title,
              topic: item.topic,
              yt_id: item.yt_id,
              url: item.url,
            })
          }
        />
        <NavButton
          title="Delete Video"
          customClick={() =>
            navigation.navigate("DeleteVideo", {
              video_id: item.video_id,
              yt_id: item.yt_id,
            })
          }
        />

        <NavButton
          title="Edit Video Quiz"
          customClick={async () => {
            await getQuiz(item.yt_id);
            console.log("yt_id ViewV: " + item.yt_id);
            navigation.navigate("EditVideoQuiz", {
              video_id: item.yt_id,
              questions: questions,
              choices: choices,
              correct: correct,
              title: item.title,
              topic: item.topic,
            });
          }}
        />

        <NavButton
          title="Take Quiz"
          customClick={async () => {
            await getQuiz(item.yt_id);
            navigation.navigate("ViewQuiz", {
              id: item.yt_id,
              questions: questions,
              choices: choices,
              correct: correct,
            });
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "#dbb42b" }}>
        <FlatList
          data={flatListItems}
          ItemSeparatorComponent={listViewItemSeparator}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => listItemView(item)}
        />
      </View>
    </SafeAreaView>
  );
};

export default ViewVideos;
