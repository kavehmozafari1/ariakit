import * as React from "react";
import {
  unstable_SealedInitialState,
  unstable_useSealedState
} from "../utils/useSealedState";
import {
  PopoverState,
  PopoverActions,
  PopoverInitialState,
  usePopoverState
} from "../Popover/PopoverState";
import { Keys } from "../__utils/types";
import {
  RoverState,
  RoverActions,
  RoverInitialState,
  useRoverState
} from "../Rover";
import { MenuContext } from "./__utils/MenuContext";

export type MenuState = RoverState &
  PopoverState & {
    /**
     * Stores the values of radios and checkboxes within the menu.
     */
    unstable_values: Record<string, any>;
  };

export type MenuActions = RoverActions &
  PopoverActions & {
    /**
     * Updates checkboxes and radios values within the menu.
     */
    unstable_update: (name: string, value?: any) => void;
  };

export type MenuInitialState = RoverInitialState &
  PopoverInitialState &
  Partial<Pick<MenuState, "unstable_values">>;

export type MenuStateReturn = MenuState & MenuActions;

export function useMenuState(
  initialState: unstable_SealedInitialState<MenuInitialState> = {}
): MenuStateReturn {
  const {
    orientation = "vertical",
    unstable_gutter: initialGutter = 0,
    unstable_values: initialValues = {},
    ...sealed
  } = unstable_useSealedState(initialState);

  const [values, setValues] = React.useState(initialValues);
  const parent = React.useContext(MenuContext);

  const placement =
    sealed.placement ||
    (parent && parent.orientation === "vertical"
      ? "right-start"
      : "bottom-start");

  const rover = useRoverState({ ...sealed, orientation });
  const popover = usePopoverState({
    ...sealed,
    placement,
    unstable_gutter: initialGutter
  });

  React.useEffect(() => {
    if (!popover.visible) {
      rover.unstable_reset();
    }
  }, [popover.visible]);

  return {
    ...rover,
    ...popover,
    unstable_values: values,
    unstable_update: React.useCallback((name, value) => {
      setValues(vals => ({
        ...vals,
        [name]: typeof value === "function" ? value(vals) : value
      }));
    }, [])
  };
}

const keys: Keys<MenuStateReturn> = [
  ...useRoverState.__keys,
  ...usePopoverState.__keys,
  "unstable_values",
  "unstable_update"
];

useMenuState.__keys = keys;
