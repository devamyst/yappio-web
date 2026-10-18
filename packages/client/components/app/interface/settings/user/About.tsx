import { Trans } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

import { YAPPIO_SOURCE_URL } from "@revolt/common";
import { Column, Text } from "@revolt/ui";

import pkg from "../../../../../../../package.json";

export function About() {
  return (
    <Column gap="lg">
      <Card>
        <Text class="title" size="large">
          <Trans>About Yappio</Trans>
        </Text>
        <Text class="body">
          <Trans>
            I built Yappio on top of Stoat, the open-source chat project. The
            interface and the servers are my own work, but the foundation is
            theirs and I want to give them credit for it.
          </Trans>
        </Text>
        <Text class="body">
          <Trans>
            Stoat is released under the GNU Affero General Public License v3.0
            (AGPL-3.0), and Yappio is released under the same license. You can
            read, run and change the source code.
          </Trans>
        </Text>
        <Text class="body">
          <a href={YAPPIO_SOURCE_URL} target="_blank" rel="noopener noreferrer">
            {YAPPIO_SOURCE_URL}
          </a>
        </Text>
        <Text class="label">
          <Trans>Version: {pkg.version}</Trans>
        </Text>
      </Card>
    </Column>
  );
}

const Card = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--gap-md)",
    padding: "var(--gap-lg)",
    borderRadius: "var(--borderRadius-lg)",
    background: "var(--md-sys-color-surface-container)",
    color: "var(--md-sys-color-on-surface)",

    "& a": {
      color: "var(--md-sys-color-primary)",
      wordBreak: "break-all",
    },
  },
});
