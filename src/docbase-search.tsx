import { List, Action, ActionPanel, getPreferenceValues, showToast, Toast, Icon } from "@raycast/api";
import { useState, useEffect } from "react";
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

interface Preferences {
  accessToken: string;
  teamName: string;
}

type Props = {
  arguments: {
    keyword: string;
  };
};

// ref. https://help.docbase.io/posts/45703
type Tag = { name: string };
type User = { name: string; profile_image_url: string };
type PostItem = { id: number; title: string; body: string; url: string; tags: Tag[]; user: User };

export default function Command(props: Props) {
  const preferences = getPreferenceValues<Preferences>();
  const [searchKeyword, setSearchKeyword] = useState(props.arguments.keyword || "");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const resultInfo = searchKeyword
    ? posts
      ? `${posts?.length} posts`
      : `searching for ${searchKeyword}`
    : "search for posts...";

  useEffect(() => {
    const options: AxiosRequestConfig = {
      url: `https://api.docbase.io/teams/${preferences.teamName}/posts?q=${searchKeyword}`,
      method: "GET",
      headers: { "X-DocBaseToken": preferences.accessToken },
    };

    axios(options)
      .then((res: AxiosResponse) => {
        const { data } = res;
        setPosts(data.posts);
      })
      .catch((e: AxiosError<{ error: string }>) => {
        showToast(Toast.Style.Failure, e.message);
      });
  }, [searchKeyword]);

  return (
    <List
      searchBarPlaceholder="Search words..."
      searchText={searchKeyword}
      onSearchTextChange={setSearchKeyword}
      throttle
    >
      <List.Item title="" subtitle={resultInfo} />
      <List.Section title="Result">
        {posts?.map((item) => {
          return (
            <List.Item
              key={item.id}
              icon={{ source: Icon.Document }}
              accessories={[
                { icon: Icon.Tag, text: item.tags.map((x) => x.name).join(",") },
                { icon: item.user.profile_image_url, tooltip: item.user.name },
              ]}
              title={item.title}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser url={item.url} />
                  <Action.CopyToClipboard content={item.url} shortcut={{ modifiers: ["ctrl"], key: "c" }} />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>
    </List>
  );
}
