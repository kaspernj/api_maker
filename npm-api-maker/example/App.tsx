import {useEvent} from "expo"
import ApiMaker, {ApiMakerView} from "api-maker"
import {Button, SafeAreaView, ScrollView, Text, View} from "react-native"

export default function App() {
  const onChangePayload = useEvent(ApiMaker, "onChange")

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>
          Module API Example
        </Text>
        <Group name="Constants">
          <Text>
            {ApiMaker.PI}
          </Text>
        </Group>
        <Group name="Functions">
          <Text>
            {ApiMaker.hello()}
          </Text>
        </Group>
        <Group name="Async functions">
          <Button
            onPress={async() => {
              await ApiMaker.setValueAsync("Hello from JS!")
            }}
            title="Set value"
          />
        </Group>
        <Group name="Events">
          <Text>
            {onChangePayload?.value}
          </Text>
        </Group>
        <Group name="Views">
          <ApiMakerView
            onLoad={({nativeEvent: {url}}) => console.log(`Loaded: ${url}`)}
            style={styles.view}
            url="https://www.example.com"
          />
        </Group>
      </ScrollView>
    </SafeAreaView>
  )
}

function Group(props: { readonly name: string; readonly children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>
        {props.name}
      </Text>
      {props.children}
    </View>
  )
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20
  },
  group: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20
  },
  container: {
    flex: 1,
    backgroundColor: "#eee"
  },
  view: {
    flex: 1,
    height: 200
  }
}
