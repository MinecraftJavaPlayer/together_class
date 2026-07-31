import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

const RANK_IMAGES: Record<string, any> = {
  bronze: require('../../../assets/ranks/bronze.jpg'),
  silver: require('../../../assets/ranks/silver.jpg'),
  gold: require('../../../assets/ranks/gold.jpg'),
  diamond: require('../../../assets/ranks/diamond.jpg'),
  master: require('../../../assets/ranks/master.jpg'),
};

interface Props {
  tierGroup: string;
  style?: StyleProp<ImageStyle>;
}

export const RankEmblemImage = ({ tierGroup, style }: Props) => {
  const source = RANK_IMAGES[tierGroup] || RANK_IMAGES.bronze;
  return <Image source={source} style={[{ width: 56, height: 56, borderRadius: 12 }, style]} resizeMode="cover" />;
};
