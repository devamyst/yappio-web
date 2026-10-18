import { Show } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { ServerMember, User } from "stoat.js";

import { timeLocale, useTime } from "@revolt/i18n";

import { Text } from "../../design";
import { OverflowingText } from "../../utils";

import { CardTitle, ProfileCard } from "./ProfileCard";

export function ProfileJoined(props: { user: User; member?: ServerMember }) {
  const dayjs = useTime();

  return (
    <ProfileCard>
      <CardTitle>
        <Trans>Joined</Trans>
      </CardTitle>
      <Text class="label">
        <OverflowingText>Yappio</OverflowingText>
        {/* <Trans>Account Created</Trans> */}
      </Text>
      <Text>
        {dayjs(props.user.createdAt).format(
          timeLocale()[1]
            .formats.L?.replace("MM", "MMM")
            .replaceAll("/", " ")
            .replaceAll("-", " "),
        )}
      </Text>
      <Show when={props.member}>
        <Text class="label">
          <OverflowingText>{props.member!.server!.name}</OverflowingText>
          {/* <Trans>Member Since</Trans> */}
        </Text>
        <Text>
          {dayjs(props.member!.joinedAt).format(
            timeLocale()[1]
              .formats.L?.replace("MM", "MMM")
              .replaceAll("/", " ")
              .replaceAll("-", " "),
          )}
        </Text>
      </Show>
      <Show when={props.member?.timeout && props.member.timeout > new Date()}>
        <Text class="label">
          <Trans>Timed out until</Trans>
        </Text>
        <Text>{dayjs(props.member!.timeout).format("lll")}</Text>
      </Show>
    </ProfileCard>
  );
}
