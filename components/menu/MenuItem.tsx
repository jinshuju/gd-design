'use client'

import classNames from 'classnames';
import type { MenuItemProps as RcMenuItemProps } from 'rc-menu';
import { Item } from 'rc-menu';
import toArray from 'rc-util/lib/Children/toArray';
import * as React from 'react';
import type { SiderContextProps } from '../layout/Sider';
import { SiderContext } from '../layout/Sider';
import type { TooltipProps } from '../tooltip';
import Tooltip from '../tooltip';
import { cloneElement, isValidElement } from '../_util/reactNode';
import type { MenuContextProps } from './MenuContext';
import MenuContext from './MenuContext';

export interface MenuItemProps extends Omit<RcMenuItemProps, 'title'> {
  icon?: React.ReactNode;
  danger?: boolean;
  title?: React.ReactNode;
}

export default class MenuItem extends React.Component<MenuItemProps> {
  static contextType = MenuContext;

  context: MenuContextProps;

  renderItemChildren(inlineCollapsed: boolean) {
    const { prefixCls, firstLevel } = this.context;
    const { icon, children } = this.props;

    const wrapNode = <span className={`${prefixCls}-title-content`}>{children}</span>;
    // inline-collapsed.md demo 依赖 span 来隐藏文字,有 icon 属性，则内部包裹一个 span
    // ref: https://github.com/ant-design/ant-design/pull/23456
    if (!icon || (isValidElement(children) && children.type === 'span')) {
      if (children && inlineCollapsed && firstLevel && typeof children === 'string') {
        return <div className={`${prefixCls}-inline-collapsed-noicon`}>{children.charAt(0)}</div>;
      }
    }
    return wrapNode;
  }

  renderItem = ({ siderCollapsed }: SiderContextProps) => {
    const { prefixCls, firstLevel, inlineCollapsed, direction, disableMenuItemTitleTooltip } =
      this.context;
    const { className, children } = this.props;
    const { title, icon, danger, ...rest } = this.props;

    let tooltipTitle = title;
    if (typeof title === 'undefined') {
      tooltipTitle = firstLevel ? children : '';
    } else if (title === false) {
      tooltipTitle = '';
    }
    const tooltipProps: TooltipProps = {
      title: tooltipTitle,
    };

    if (!siderCollapsed && !inlineCollapsed) {
      tooltipProps.title = null;
      // Reset `open` to fix control mode tooltip display not correct
      // ref: https://github.com/ant-design/ant-design/issues/16742
      tooltipProps.open = false;
    }
    const childrenLength = toArray(children).length;

    let returnNode = (
      <Item
        {...rest}
        className={classNames(
          {
            [`${prefixCls}-item-danger`]: danger,
            [`${prefixCls}-item-only-child`]: (icon ? childrenLength + 1 : childrenLength) === 1,
          },
          className,
        )}
        title={typeof title === 'string' ? title : undefined}
      >
        {cloneElement(icon, {
          className: classNames(
            isValidElement(icon) ? icon.props?.className : '',
            `${prefixCls}-item-icon`,
          ),
        })}
        {this.renderItemChildren(inlineCollapsed)}
      </Item>
    );

    if (!disableMenuItemTitleTooltip) {
      returnNode = (
        <Tooltip
          {...tooltipProps}
          placement={direction === 'rtl' ? 'left' : 'right'}
          overlayClassName={`${prefixCls}-inline-collapsed-tooltip`}
        >
          {returnNode}
        </Tooltip>
      );
    }

    return returnNode;
  };

  render() {
    return <SiderContext.Consumer>{this.renderItem}</SiderContext.Consumer>;
  }
}
