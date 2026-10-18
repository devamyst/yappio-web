import { splitProps } from "solid-js";

import { typography } from "../../design/Text";
import { ColouredText } from "../../utils/ColouredText";

type Props = {
  /**
   * Username
   */
  username?: string;

  /**
   * Text colour
   */
  colour?: string;
};

/**
 * Username
 *
 * @deprecated this seems unideal
 */
export function Username(props: Props) {
  const [local, remote] = splitProps(props, ["username", "colour"]);

  return (
    <span {...remote} class={typography({ class: "label", size: "large" })} style={{ "font-weight": 700 }}>
      <ColouredText colour={local.colour!}>{local.username}</ColouredText>
    </span>
  );
}
