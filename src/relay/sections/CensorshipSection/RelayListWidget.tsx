import type { FC } from "react";
import BodyTextV3 from "../../../components/TextsNext/BodyTextV3";
import QuantifyText from "../../../components/TextsNext/QuantifyText";
import {
  WidgetBackground,
  WidgetTitle,
} from "../../../components/WidgetSubcomponents";
import { formatPercentOneDecimal } from "../../../format";
import StyledList from "../../components/StyledList";
import type { Relay } from "./RelayCensorshipWidget";

type Props = {
  relays: Relay[];
  timeFrame: "d7" | "d30";
};

const RelayListWidget: FC<Props> = ({ relays }) => (
  <WidgetBackground>
    <div className="flex flex-col gap-y-4">
      <div className="grid grid-cols-3 md:grid-cols-4">
        <WidgetTitle>relay</WidgetTitle>
        <WidgetTitle className="text-right">censors</WidgetTitle>
        <WidgetTitle className="hidden text-right md:inline">
          blocks with sanctioned entity
        </WidgetTitle>
        <WidgetTitle className="text-right">dominance</WidgetTitle>
      </div>
      <StyledList height="h-[182px]">
        {relays.map(
          ({
            blocks_with_sanctioned_entity,
            censors,
            description,
            dominance,
            id,
            name,
          }) => (
            <li
              key={id}
              className="grid grid-cols-3 hover:opacity-60 md:grid-cols-4"
            >
              <div>
                <BodyTextV3>{name}</BodyTextV3>
                {description !== undefined && (
                  <BodyTextV3
                    className="hidden md:inline"
                    color="text-slateus-200"
                  >
                    {" "}
                    {description}
                  </BodyTextV3>
                )}
              </div>
              <BodyTextV3
                className="text-right"
                color={censors ? "text-red-400" : "text-green-400"}
              >
                {censors ? "yes" : "no"}
              </BodyTextV3>
              <QuantifyText
                className="hidden text-right md:inline"
                unitPostfix="blocks"
                unitPostfixColor="text-slateus-200"
              >
                {blocks_with_sanctioned_entity}
              </QuantifyText>
              <QuantifyText className="text-right" size="text-sm md:text-base">
                {formatPercentOneDecimal(dominance)}
              </QuantifyText>
            </li>
          ),
        )}
      </StyledList>
    </div>
  </WidgetBackground>
);

export default RelayListWidget;