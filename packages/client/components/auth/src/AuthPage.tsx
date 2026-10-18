import { JSX } from "solid-js";

import { styled } from "styled-system/jsx";

import { Titlebar } from "@revolt/app/interface/desktop/Titlebar";
import { useState } from "@revolt/state";
import { IconButton, iconSize } from "@revolt/ui";

import MdDarkMode from "@material-design-icons/svg/filled/dark_mode.svg?component-solid";

import background from "./background.jpg";
import { FlowBase } from "./flows/Flow";

/**
 * Authentication page layout
 */
const Base = styled("div", {
  base: {
    width: "100%",
    height: "100%",
    padding: "40px 35px",

    userSelect: "none",
    overflowY: "scroll",

    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",

    mdDown: {
      padding: "30px 20px",
    },
  },
});

const Root = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    paddingBottom: "env(keyboard-inset-height)",

    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface)",
    // background: `var(--url)`,
    // backgroundPosition: "center",
    // backgroundRepeat: "no-repeat",
    // backgroundSize: "cover",
  },
});

/**
 * Top and bottom navigation bars
 */
const Nav = styled("div", {
  base: {
    height: "32px",
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",

    textDecoration: "none",
  },
});


/**
 * Authentication page
 */
export function AuthPage(props: { children: JSX.Element }) {
  const state = useState();

  return (
    <Root>
      <Titlebar />
      <Base
        style={{ "--url": `url('${background}')` }}
        css={{ scrollbar: "hidden" }}
      >
        <Nav>
          <div />
          <IconButton
            variant="tonal"
            onPress={() =>
              state.theme.setMode(
                state.theme.activeTheme.darkMode ? "light" : "dark",
              )
            }
          >
            <MdDarkMode {...iconSize("24px")} />
          </IconButton>
        </Nav>
        <FlowBase>{props.children}</FlowBase>
        <div />
      </Base>
    </Root>
  );
}
