import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import type { Sport } from '@/types/recruitment';

interface IconProps {
  size?: number;
  color?: string;
}

/** サッカー/フットサル: ボール */
function SoccerIcon({ size = 14, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9.5} stroke={color} strokeWidth={1.8} fill="none" />
      <Path d="M12 8 L15.8 10.8 L14.4 15.2 L9.6 15.2 L8.2 10.8 Z" fill={color} />
      <Line x1={12} y1={8} x2={12} y2={2.8} stroke={color} strokeWidth={1.6} />
      <Line x1={15.8} y1={10.8} x2={20.8} y2={9} stroke={color} strokeWidth={1.6} />
      <Line x1={14.4} y1={15.2} x2={17.4} y2={19.6} stroke={color} strokeWidth={1.6} />
      <Line x1={9.6} y1={15.2} x2={6.6} y2={19.6} stroke={color} strokeWidth={1.6} />
      <Line x1={8.2} y1={10.8} x2={3.2} y2={9} stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

/** 野球: ボールと縫い目 */
function BaseballIcon({ size = 14, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9.5} stroke={color} strokeWidth={1.8} fill="none" />
      <Path
        d="M5.5 4.5 C9.5 8, 9.5 16, 5.5 19.5"
        stroke={color}
        strokeWidth={1.6}
        fill="none"
      />
      <Path
        d="M18.5 4.5 C14.5 8, 14.5 16, 18.5 19.5"
        stroke={color}
        strokeWidth={1.6}
        fill="none"
      />
    </Svg>
  );
}

/** バスケ: ボールとライン */
function BasketballIcon({ size = 14, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9.5} stroke={color} strokeWidth={1.8} fill="none" />
      <Line x1={12} y1={2.5} x2={12} y2={21.5} stroke={color} strokeWidth={1.6} />
      <Line x1={2.5} y1={12} x2={21.5} y2={12} stroke={color} strokeWidth={1.6} />
      <Path d="M5 5.5 C8.5 9, 8.5 15, 5 18.5" stroke={color} strokeWidth={1.6} fill="none" />
      <Path d="M19 5.5 C15.5 9, 15.5 15, 19 18.5" stroke={color} strokeWidth={1.6} fill="none" />
    </Svg>
  );
}

/** バレー: ボールと流線 */
function VolleyballIcon({ size = 14, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9.5} stroke={color} strokeWidth={1.8} fill="none" />
      <Path d="M12 2.5 C8 8, 8 16, 11 21.4" stroke={color} strokeWidth={1.6} fill="none" />
      <Path d="M2.8 10 C9 12, 17 12, 21.2 10" stroke={color} strokeWidth={1.6} fill="none" />
      <Path d="M18 5 C15 10, 10 14, 3.5 15" stroke={color} strokeWidth={1.6} fill="none" />
    </Svg>
  );
}

/** 陸上: ストップウォッチ */
function RunningIcon({ size = 14, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={13.5} r={8} stroke={color} strokeWidth={1.8} fill="none" />
      <Line x1={12} y1={13.5} x2={15.5} y2={10} stroke={color} strokeWidth={1.8} />
      <Line x1={9.5} y1={2.5} x2={14.5} y2={2.5} stroke={color} strokeWidth={1.8} />
      <Line x1={12} y1={2.5} x2={12} y2={5.5} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

const SportIcons: Record<Sport, (props: IconProps) => React.JSX.Element> = {
  soccer: SoccerIcon,
  futsal: SoccerIcon,
  baseball: BaseballIcon,
  basketball: BasketballIcon,
  volleyball: VolleyballIcon,
  running: RunningIcon,
};

/** 種目アイコン */
export function SportIcon({ sport, ...props }: IconProps & { sport: Sport }) {
  const Icon = SportIcons[sport];
  return <Icon {...props} />;
}

/** チーム(シールド) */
export function ShieldIcon({ size = 14, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2.5 L20 5.5 V11.5 C20 16.5 16.6 20 12 21.8 C7.4 20 4 16.5 4 11.5 V5.5 Z"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** ガチ度(炎) */
export function FlameIcon({ size = 12, color = '#E5484D' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2.5 C13 7 17.5 8.6 17.5 13 A5.5 5.5 0 0 1 6.5 13 C6.5 10.7 7.8 9.2 9.3 7.7 C10.2 10 11.5 6 12 2.5 Z"
        fill={color}
      />
    </Svg>
  );
}

/** カレンダー */
export function CalendarIcon({ size = 14, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect
        x={3.5}
        y={5}
        width={17}
        height={15.5}
        rx={2}
        stroke={color}
        strokeWidth={1.8}
        fill="none"
      />
      <Line x1={3.5} y1={9.5} x2={20.5} y2={9.5} stroke={color} strokeWidth={1.8} />
      <Line x1={8} y1={2.8} x2={8} y2={6.5} stroke={color} strokeWidth={1.8} />
      <Line x1={16} y1={2.8} x2={16} y2={6.5} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}
