/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import axios from 'axios';
import React, {memo, useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  Button,
  Card,
  Dialog,
  Divider,
  Headline,
  List,
  PaperProvider,
  Portal,
} from 'react-native-paper';

const RightAccordionSection: React.FC<{
  expanded: boolean;
  handleGoTop: any;
  setExpanded: Function;
}> = ({expanded = false, handleGoTop = () => {}, setExpanded = () => {}}) => {
  return (
    <View style={styles.flexRow}>
      <Button
        buttonColor="green"
        textColor="white"
        style={{marginRight: 5}}
        onPress={() => {
          setExpanded(!expanded);
          handleGoTop();
        }}>
        Go Top
      </Button>
      <List.Icon icon={expanded ? 'chevron-up' : 'chevron-down'} />
    </View>
  );
};

const Section: React.FC<{
  category: Categories;
  index: number;
  handleGoTop: any;
  showDialog: any;
  fetchJokesData: Function;
}> = memo(
  ({
    category = {},
    index = 0,
    handleGoTop = () => {},
    showDialog = () => {},
    fetchJokesData = () => {},
  }) => {
    const [expanded, setExpanded] = useState(false);
    useEffect(() => {
      fetchJokesData(category.category);
    }, []); // eslint-disable-line

    const _handleExpand = () => {
      setExpanded(!expanded);
    };

    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <List.Accordion
            pointerEvents="box-none"
            title={category?.category}
            expanded={expanded}
            onPress={_handleExpand}
            right={props => (
              <RightAccordionSection
                {...props}
                expanded={expanded}
                handleGoTop={handleGoTop}
                setExpanded={setExpanded}
              />
            )}
            left={props => (
              <List.Item
                {...props}
                titleStyle={{fontWeight: 'bold'}}
                title={index + 1}
              />
            )}>
            <>
              <Text style={styles.jokeListHeader}>
                {' '}
                List of jokes based on {category.category} categories
              </Text>
              {category.jokes &&
                category.jokes.map((item: any, idx: number) => (
                  <TouchableOpacity onPress={() => showDialog(item?.joke)}>
                    <View style={styles.jokesContainer}>
                      <Text style={styles.indexStyle}>{idx + 1}</Text>
                      <List.Item
                        key={idx}
                        title={item.joke}
                        titleNumberOfLines={10}
                      />
                    </View>
                    <Divider />
                  </TouchableOpacity>
                ))}
              {category?.jokes?.length < 6 && (
                <Button
                  compact
                  mode="text"
                  onPress={() => fetchJokesData(category.category)}>
                  Add More
                </Button>
              )}
            </>
          </List.Accordion>
        </Card>
      </View>
    );
  },
);

const JokeDialog: React.FC<{
  joke: string;
  visible: boolean;
  setVisible: any;
}> = memo(({joke = '', visible = false, setVisible = () => {}}) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={() => setVisible(false)}>
        <Dialog.Title>Random Joke</Dialog.Title>
        <Dialog.Content>
          <Text>{joke}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setVisible(false)}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
});

interface Categories {
  category: string;
  index: number;
  jokes: Array<string>;
}

const App: React.FC = () => {
  const [categories, setCategories] = useState<Categories[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [jokeOnDialog, setJokeOnDialog] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    _fetchCategories();
  }, []);

  const _fetchCategories = () => {
    axios.get('https://v2.jokeapi.dev/categories').then(res => {
      if (res.status === 200) {
        const categoriesTemp = res.data.categories;
        const categoriesList = categoriesTemp.map(
          (category: string, index: number) => ({
            category,
            index,
            jokes: [],
          }),
        );
        setCategories(categoriesList);
      }
    });
  };

  const _fetchJokes = (categoryName: string) => {
    axios
      .get(`https://v2.jokeapi.dev/joke/${categoryName}?type=single&amount=2`)
      .then(res => {
        if (res.status === 200) {
          const jokesTemp = res.data.jokes;
          setCategories(prevCategories =>
            prevCategories.map(category =>
              category.category === categoryName
                ? {...category, jokes: [...category.jokes, ...jokesTemp]}
                : category,
            ),
          );
        }
      });
  };

  const _moveToFront = (index: number) => {
    setCategories(prevCategories => {
      if (index > -1) {
        prevCategories.unshift(prevCategories.splice(index, 1)[0]);
      }
      return [...prevCategories];
    });
  };

  const _handleShowDialog = (joke: string) => {
    setShowDialog(true);
    setJokeOnDialog(joke);
  };

  const _onRefresh = () => {
    setCategories([]);
    setRefreshing(true);
    _fetchCategories();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <PaperProvider>
      <Headline style={{textAlign: 'center', fontWeight: 'bold'}}>
        Joke App
      </Headline>
      <FlatList
        refreshing={refreshing}
        onRefresh={_onRefresh}
        style={{marginBottom: 20}}
        data={categories}
        keyExtractor={item => item.category}
        initialNumToRender={5}
        renderItem={({item, index}) => (
          <Section
            category={item}
            index={index}
            handleGoTop={() => _moveToFront(index)}
            showDialog={_handleShowDialog}
            fetchJokesData={_fetchJokes}
          />
        )}
      />
      <JokeDialog
        visible={showDialog}
        setVisible={setShowDialog}
        joke={jokeOnDialog}
      />
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  card: {
    width: '95%',
    borderRadius: 12,
    elevation: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    flex: 1,
    borderColor: '#000',
  },
  jokeListHeader: {
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 5,
  },
  jokesContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
  },
  indexStyle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'black',
  },
});

export default App;
