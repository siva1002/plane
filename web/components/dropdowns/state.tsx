import { Fragment, ReactNode, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { Combobox } from "@headlessui/react";
import { usePopper } from "react-popper";
import { Check, ChevronDown, Search } from "lucide-react";
// hooks
import { useApplication, useProjectState } from "hooks/store";
import { useDropdownKeyDown } from "hooks/use-dropdown-key-down";
import useOutsideClickDetector from "hooks/use-outside-click-detector";
// icons
import { StateGroupIcon, Tooltip } from "@plane/ui";
// helpers
import { cn } from "helpers/common.helper";
// types
import { IState } from "@plane/types";
import { TDropdownProps } from "./types";

type Props = TDropdownProps & {
  button?: ReactNode;
  dropdownArrow?: boolean;
  dropdownArrowClassName?: string;
  onChange: (val: string) => void;
  projectId: string;
  value: string;
};

type ButtonProps = {
  className?: string;
  dropdownArrow: boolean;
  dropdownArrowClassName: string;
  hideIcon?: boolean;
  hideText?: boolean;
  isActive?: boolean;
  state: IState | undefined;
  tooltip: boolean;
};

const BorderButton = (props: ButtonProps) => {
  const {
    className,
    dropdownArrow,
    dropdownArrowClassName,
    hideIcon = false,
    hideText = false,
    isActive = false,
    state,
    tooltip,
  } = props;

  return (
    <Tooltip tooltipHeading="State" tooltipContent={state?.name ?? "State"} disabled={!tooltip}>
      <div
        className={cn(
          "h-full flex items-center gap-1.5 border-[0.5px] border-custom-border-300 hover:bg-custom-background-80 rounded text-xs px-2 py-0.5",
          {
            "bg-custom-background-80": isActive,
          },
          className
        )}
      >
        {!hideIcon && (
          <StateGroupIcon
            stateGroup={state?.group ?? "backlog"}
            color={state?.color}
            className="h-3 w-3 flex-shrink-0"
          />
        )}
        {!hideText && <span className="flex-grow truncate">{state?.name ?? "State"}</span>}
        {dropdownArrow && (
          <ChevronDown className={cn("h-2.5 w-2.5 flex-shrink-0", dropdownArrowClassName)} aria-hidden="true" />
        )}
      </div>
    </Tooltip>
  );
};

const BackgroundButton = (props: ButtonProps) => {
  const {
    className,
    dropdownArrow,
    dropdownArrowClassName,
    hideIcon = false,
    hideText = false,
    state,
    tooltip,
  } = props;

  return (
    <Tooltip tooltipHeading="State" tooltipContent={state?.name ?? "State"} disabled={!tooltip}>
      <div
        className={cn(
          "h-full flex items-center gap-1.5 rounded text-xs px-2 py-0.5 bg-custom-background-80",
          className
        )}
      >
        {!hideIcon && (
          <StateGroupIcon
            stateGroup={state?.group ?? "backlog"}
            color={state?.color}
            className="h-3 w-3 flex-shrink-0"
          />
        )}
        {!hideText && <span className="flex-grow truncate">{state?.name ?? "State"}</span>}
        {dropdownArrow && (
          <ChevronDown className={cn("h-2.5 w-2.5 flex-shrink-0", dropdownArrowClassName)} aria-hidden="true" />
        )}
      </div>
    </Tooltip>
  );
};

const TransparentButton = (props: ButtonProps) => {
  const {
    className,
    dropdownArrow,
    dropdownArrowClassName,
    hideIcon = false,
    hideText = false,
    isActive = false,
    state,
    tooltip,
  } = props;

  return (
    <Tooltip tooltipHeading="State" tooltipContent={state?.name ?? "State"} disabled={!tooltip}>
      <div
        className={cn(
          "h-full flex items-center gap-1.5 rounded text-xs px-2 py-0.5 hover:bg-custom-background-80",
          {
            "bg-custom-background-80": isActive,
          },
          className
        )}
      >
        {!hideIcon && (
          <StateGroupIcon
            stateGroup={state?.group ?? "backlog"}
            color={state?.color}
            className="h-3 w-3 flex-shrink-0"
          />
        )}
        {!hideText && <span className="flex-grow truncate">{state?.name ?? "State"}</span>}
        {dropdownArrow && (
          <ChevronDown className={cn("h-2.5 w-2.5 flex-shrink-0", dropdownArrowClassName)} aria-hidden="true" />
        )}
      </div>
    </Tooltip>
  );
};

export const StateDropdown: React.FC<Props> = observer((props) => {
  const {
    button,
    buttonClassName,
    buttonContainerClassName,
    buttonVariant,
    className = "",
    disabled = false,
    dropdownArrow = false,
    dropdownArrowClassName = "",
    hideIcon = false,
    onChange,
    placement,
    projectId,
    tabIndex,
    tooltip = false,
    value,
  } = props;
  // states
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  // refs
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  // popper-js refs
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  // popper-js init
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: placement ?? "bottom-start",
    modifiers: [
      {
        name: "preventOverflow",
        options: {
          padding: 12,
        },
      },
    ],
  });
  // store hooks
  const {
    router: { workspaceSlug },
  } = useApplication();
  const { fetchProjectStates, getProjectStates, getStateById } = useProjectState();
  const statesList = getProjectStates(projectId);

  const options = statesList?.map((state) => ({
    value: state.id,
    query: `${state?.name}`,
    content: (
      <div className="flex items-center gap-2">
        <StateGroupIcon stateGroup={state.group} color={state.color} className="h-3 w-3 flex-shrink-0" />
        <span className="flex-grow truncate">{state?.name}</span>
      </div>
    ),
  }));

  const filteredOptions =
    query === "" ? options : options?.filter((o) => o.query.toLowerCase().includes(query.toLowerCase()));

  const selectedState = getStateById(value);

  const openDropdown = () => {
    setIsOpen(true);
    if (!statesList && workspaceSlug) fetchProjectStates(workspaceSlug, projectId);
    if (referenceElement) referenceElement.focus();
  };
  const closeDropdown = () => setIsOpen(false);
  const handleKeyDown = useDropdownKeyDown(openDropdown, closeDropdown, isOpen);
  useOutsideClickDetector(dropdownRef, closeDropdown);

  return (
    <Combobox
      as="div"
      ref={dropdownRef}
      tabIndex={tabIndex}
      className={cn("h-full", className)}
      value={value}
      onChange={onChange}
      disabled={disabled}
      onKeyDown={handleKeyDown}
    >
      <Combobox.Button as={Fragment}>
        {button ? (
          <button
            ref={setReferenceElement}
            type="button"
            className={cn("block h-full w-full outline-none", buttonContainerClassName)}
            onClick={openDropdown}
          >
            {button}
          </button>
        ) : (
          <button
            ref={setReferenceElement}
            type="button"
            className={cn(
              "block h-full max-w-full outline-none",
              {
                "cursor-not-allowed text-custom-text-200": disabled,
                "cursor-pointer": !disabled,
              },
              buttonContainerClassName
            )}
            onClick={openDropdown}
          >
            {buttonVariant === "border-with-text" ? (
              <BorderButton
                state={selectedState}
                className={buttonClassName}
                dropdownArrow={dropdownArrow && !disabled}
                dropdownArrowClassName={dropdownArrowClassName}
                hideIcon={hideIcon}
                isActive={isOpen}
                tooltip={tooltip}
              />
            ) : buttonVariant === "border-without-text" ? (
              <BorderButton
                state={selectedState}
                className={buttonClassName}
                dropdownArrow={dropdownArrow && !disabled}
                dropdownArrowClassName={dropdownArrowClassName}
                hideIcon={hideIcon}
                isActive={isOpen}
                tooltip={tooltip}
                hideText
              />
            ) : buttonVariant === "background-with-text" ? (
              <BackgroundButton
                state={selectedState}
                className={buttonClassName}
                dropdownArrow={dropdownArrow && !disabled}
                dropdownArrowClassName={dropdownArrowClassName}
                hideIcon={hideIcon}
                tooltip={tooltip}
              />
            ) : buttonVariant === "background-without-text" ? (
              <BackgroundButton
                state={selectedState}
                className={buttonClassName}
                dropdownArrow={dropdownArrow && !disabled}
                dropdownArrowClassName={dropdownArrowClassName}
                hideIcon={hideIcon}
                tooltip={tooltip}
                hideText
              />
            ) : buttonVariant === "transparent-with-text" ? (
              <TransparentButton
                state={selectedState}
                className={buttonClassName}
                dropdownArrow={dropdownArrow && !disabled}
                dropdownArrowClassName={dropdownArrowClassName}
                hideIcon={hideIcon}
                isActive={isOpen}
                tooltip={tooltip}
              />
            ) : buttonVariant === "transparent-without-text" ? (
              <TransparentButton
                state={selectedState}
                className={buttonClassName}
                dropdownArrow={dropdownArrow && !disabled}
                dropdownArrowClassName={dropdownArrowClassName}
                hideIcon={hideIcon}
                isActive={isOpen}
                tooltip={tooltip}
                hideText
              />
            ) : null}
          </button>
        )}
      </Combobox.Button>
      {isOpen && (
        <Combobox.Options className="fixed z-10" static>
          <div
            className="my-1 w-48 rounded border-[0.5px] border-custom-border-300 bg-custom-background-100 px-2 py-2.5 text-xs shadow-custom-shadow-rg focus:outline-none"
            ref={setPopperElement}
            style={styles.popper}
            {...attributes.popper}
          >
            <div className="flex items-center gap-1.5 rounded border border-custom-border-100 bg-custom-background-90 px-2">
              <Search className="h-3.5 w-3.5 text-custom-text-400" strokeWidth={1.5} />
              <Combobox.Input
                className="w-full bg-transparent py-1 text-xs text-custom-text-200 placeholder:text-custom-text-400 focus:outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                displayValue={(assigned: any) => assigned?.name}
              />
            </div>
            <div className="mt-2 max-h-48 space-y-1 overflow-y-scroll">
              {filteredOptions ? (
                filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <Combobox.Option
                      key={option.value}
                      value={option.value}
                      className={({ active, selected }) =>
                        `w-full truncate flex items-center justify-between gap-2 rounded px-1 py-1.5 cursor-pointer select-none ${
                          active ? "bg-custom-background-80" : ""
                        } ${selected ? "text-custom-text-100" : "text-custom-text-200"}`
                      }
                      onClick={closeDropdown}
                    >
                      {({ selected }) => (
                        <>
                          <span className="flex-grow truncate">{option.content}</span>
                          {selected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                ) : (
                  <p className="text-custom-text-400 italic py-1 px-1.5">No matches found</p>
                )
              ) : (
                <p className="text-custom-text-400 italic py-1 px-1.5">Loading...</p>
              )}
            </div>
          </div>
        </Combobox.Options>
      )}
    </Combobox>
  );
});
