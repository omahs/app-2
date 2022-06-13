import React, {useEffect, useState} from 'react';
import styled from 'styled-components';

import {IconType} from '../../icons';

export type IlluHumanHairProps = {
  hair?:
    | 'long'
    | 'afro'
    | 'bald'
    | 'bun'
    | 'cool'
    | 'curly_bangs'
    | 'curly'
    | 'informal'
    | 'middle'
    | 'oldschool'
    | 'punk'
    | 'short';
  body:
    | 'relaxed'
    | 'aragon'
    | 'blocks'
    | 'chart'
    | 'computer_correct'
    | 'computer'
    | 'correct'
    | 'double_correct'
    | 'elevating'
    | 'sending_love'
    | 'voting';
  expression:
    | 'angry'
    | 'casual'
    | 'crying'
    | 'decided'
    | 'excited'
    | 'sad_left'
    | 'sad_right'
    | 'smile_wink'
    | 'smile'
    | 'surprised'
    | 'suspecting';
  sunglass?:
    | 'big_rounded'
    | 'big_semirounded'
    | 'large_stylized_xl'
    | 'large_stylized'
    | 'pirate'
    | 'small_intellectual'
    | 'small_sympathetic'
    | 'small_weird_one'
    | 'small_weird_two'
    | 'thuglife_rounded'
    | 'thuglife';
  accessory?:
    | 'buddha'
    | 'earrings_circle'
    | 'earrings_hoops'
    | 'earrings_rhombus'
    | 'earrings_skull'
    | 'earrings_thunder'
    | 'expression'
    | 'flushed'
    | 'head_flower'
    | 'piercings_tattoo'
    | 'piercings';
  height?: number;
  width?: number;
};

export type StringIndexed = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: IconType;
};

type svgType = {
  Expression: IconType;
  Body?: IconType;
  Hair?: IconType | null;
  Sunglass?: IconType | null;
  Accessory?: IconType | null;
};

export const IlluHuman: React.FC<IlluHumanHairProps> = ({
  body = 'long',
  expression = 'aragon',
  hair,
  sunglass,
  accessory,
  height,
  width,
}) => {
  const [Svgs, setSvgs] = useState<svgType>({} as svgType);
  useEffect(() => {
    async function fetchIcons() {
      await Promise.all([
        import(`./human_expressions/${expression}`),
        import(`./human_bodies/${body}`),
        import(`./human_hairs/${hair || 'long'}`),
        import(`./human_sunglasses/${sunglass || 'big_rounded'}`),
        import(`./human_accessories/${accessory || 'buddha'}`),
      ]).then(values => {
        setSvgs({
          Expression: (values[0] as StringIndexed).default,
          Body: (values[1] as StringIndexed).default,
          Hair: hair ? (values[2] as StringIndexed).default : null,
          Sunglass: sunglass ? (values[3] as StringIndexed).default : null,
          Accessory: accessory ? (values[4] as StringIndexed).default : null,
        });
      });
    }
    fetchIcons();
  }, [accessory, body, expression, hair, sunglass]);

  console.log(Svgs);

  return (
    <Container data-testid="illu-human">
      {Svgs.Hair && (
        <Item>
          <Svgs.Hair {...{height, width}} />
        </Item>
      )}
      {Svgs.Expression && (
        <Item>
          <Svgs.Expression {...{height, width}} />
        </Item>
      )}
      {Svgs.Body && (
        <Item>
          <Svgs.Body {...{height, width}} />
        </Item>
      )}
      {Svgs.Sunglass && (
        <Item>
          <Svgs.Sunglass {...{height, width}} />
        </Item>
      )}
      {Svgs.Accessory && (
        <Item>
          <Svgs.Accessory {...{height, width}} />
        </Item>
      )}
    </Container>
  );
};

const Container = styled.div.attrs({
  className: 'relative',
})``;

const Item = styled.div.attrs({
  className: 'absolute',
})``;
