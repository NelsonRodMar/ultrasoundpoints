import * as DateFns from "date-fns";
import { FC, ReactEventHandler, useCallback } from "react";
import CountUp from "react-countup";
import Skeleton from "react-loading-skeleton";
import * as Contracts from "../../../api/contracts";
import { LeaderboardEntry } from "../../../api/leaderboards";
import { Unit } from "../../../denomination";
import { getFeatureFlags } from "../../../feature-flags";
import * as Format from "../../../format";
import { AmountUnitSpace } from "../../Spacing";

const onSetTwitterHandle = async (address: string) => {
  const handle = window.prompt(`input twitter handle`);
  if (handle === null) {
    return;
  }
  await Contracts.setContractTwitterHandle(address, handle);
};

const onSetName = async (address: string) => {
  const nameInput = window.prompt(`input name`);
  if (nameInput === null) {
    return;
  }
  await Contracts.setContractName(address, nameInput);
};

const onSetCategory = async (address: string) => {
  const category = window.prompt(`input category`);
  if (category === null) {
    return;
  }
  await Contracts.setContractCategory(address, category);
};

const getOpacityFromAge = (dt: Date | undefined) =>
  dt === undefined
    ? 1
    : Math.min(
        1,
        0.2 + (0.8 / 168) * DateFns.differenceInHours(new Date(), dt),
      );

const AdminControls: FC<{
  address: string;
  freshness: Contracts.MetadataFreshness | undefined;
}> = ({ address, freshness }) => (
  <>
    <div className="flex flex-row gap-4">
      <a
        className="text-pink-300 hover:opacity-60 hover:text-pink-300 cursor-pointer"
        onClick={() => onSetTwitterHandle(address)}
        target="_blank"
        rel="noreferrer"
      >
        set handle
      </a>
      <a
        className="text-pink-300 hover:opacity-60 hover:text-pink-300 cursor-pointer"
        onClick={() => onSetName(address)}
        target="_blank"
        rel="noreferrer"
      >
        set name
      </a>
      <a
        className="text-pink-300 hover:opacity-60 hover:text-pink-300 cursor-pointer"
        onClick={() => onSetCategory(address)}
        target="_blank"
        rel="noreferrer"
      >
        set category
      </a>
      <a
        className="text-pink-300 hover:opacity-60 hover:text-pink-300 cursor-pointer"
        onClick={() => Contracts.setContractLastManuallyVerified(address)}
        target="_blank"
        rel="noreferrer"
      >
        set verified
      </a>
    </div>
    <div className="flex text-sm text-white gap-x-4 mt-2">
      <span
        className="bg-gray-700 rounded-lg py-1 px-2"
        style={{
          opacity: getOpacityFromAge(freshness?.openseaContractLastFetch),
        }}
      >
        {freshness?.openseaContractLastFetch === undefined
          ? "never fetched"
          : `opensea fetch ${DateFns.formatDistanceToNowStrict(
              freshness.openseaContractLastFetch,
            )} ago`}
      </span>
      <span
        className="bg-gray-700 rounded-lg py-1 px-2"
        style={{
          opacity: getOpacityFromAge(freshness?.lastManuallyVerified),
        }}
      >
        {freshness?.lastManuallyVerified === undefined
          ? "never verified"
          : `last verified ${DateFns.formatDistanceToNowStrict(
              freshness.lastManuallyVerified,
            )} ago`}
      </span>
    </div>
  </>
);

type Props = {
  address?: string;
  adminToken?: string;
  category?: string | undefined;
  detail?: string;
  fees: number | undefined;
  freshness?: Contracts.MetadataFreshness;
  image?: string | undefined;
  isBot?: boolean | undefined;
  name: string | undefined;
  type: LeaderboardEntry["type"] | undefined;
  unit: Unit;
};

const LeaderboardRow: FC<Props> = ({
  address,
  adminToken,
  category,
  detail,
  fees,
  freshness,
  image,
  isBot,
  name,
  type,
  unit,
}) => {
  const featureFlags = getFeatureFlags();
  const imgSrc =
    typeof image === "string"
      ? image
      : type === "eth-transfers"
      ? "/leaderboard-images/transfer-v2.svg"
      : isBot
      ? "/leaderboard-images/bot-v2.svg"
      : type === "contract-creations"
      ? "/leaderboard-images/contract-creations.svg"
      : "/leaderboard-images/question-mark-v2.svg";

  //Your handler Component
  const onImageError = useCallback<ReactEventHandler<HTMLImageElement>>((e) => {
    (e.target as HTMLImageElement).src =
      "/leaderboard-images/question-mark-v2.svg";
  }, []);

  return (
    <>
      <div className="pt-2.5 pb-2.5 pr-2.5">
        <a
          href={
            address === undefined
              ? undefined
              : `https://etherscan.io/address/${address}`
          }
          target="_blank"
          rel="noreferrer"
        >
          <div
            className={`
              hover:opacity-60 link-animation
              flex flex-row items-center
              font-inter font-light
              text-white text-base md:text-lg
            `}
          >
            <img
              className="w-8 h-8 rounded-full"
              src={imgSrc}
              alt=""
              onError={onImageError}
              width="32"
              height="32"
            />
            <p className="pl-4 truncate">
              {typeof name === "string" ? (
                name
              ) : typeof address === "string" ? (
                <span className="font-roboto">
                  {"0x" + address.slice(2, 6)}
                  <span className="font-inter">...</span>
                  {address.slice(38, 42)}
                </span>
              ) : (
                <Skeleton inline={true} width="12rem" />
              )}
            </p>
            {featureFlags.enableCategories && category && (
              <p className="px-1.5 py-0.5 ml-2 text-sm rounded-sm text-blue-manatee font-normal hidden md:block lg:hidden xl:block bg-blue-highlightbg">
                {category}
              </p>
            )}
            {detail && (
              <p className="pl-2 truncate font-extralight text-blue-shipcove hidden md:block lg:hidden xl:block">
                {detail}
              </p>
            )}
            <p className="pl-4 whitespace-nowrap ml-auto font-roboto font-light">
              {fees === undefined ? (
                <Skeleton inline={true} width="4rem" />
              ) : (
                <CountUp
                  start={0}
                  end={unit === "eth" ? Format.ethFromWei(fees) : fees / 1000}
                  preserveValue={true}
                  separator=","
                  decimals={unit === "eth" ? 2 : 1}
                  duration={0.8}
                  suffix={unit === "eth" ? undefined : "K"}
                />
              )}
              <AmountUnitSpace />
              <span className="text-blue-spindle font-extralight">
                {unit === "eth" ? "ETH" : "USD"}
              </span>
            </p>
          </div>
        </a>
        {adminToken !== undefined && address !== undefined && (
          <AdminControls address={address} freshness={freshness} />
        )}
      </div>
    </>
  );
};

export default LeaderboardRow;