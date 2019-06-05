import React, { Component } from 'react';
import Operator from './operator';
import './index.less';
const { by, operator, operators } = Operator;
const { debounceTime } = operators;

export class List extends by(Component) {
    constructor(props) {
        super(props);
        const { adapter } = props;
        if (!adapter) {
            throw new Error('没有找到任何有效的 adapter');
        }
        this.listRef = React.createRef();
        adapter.binded(this);
        this.state = {
            start: 0,
            height: 0,
            offFoot: 0,
            maxHeight: 0,
        }
    }

    componentDidMount() {
        const { adapter } = this.props;
        let height = 0;
        !this.listRef.current ? (height = this.props.adapter.defaultHeight) : (height = this.listRef.current.clientHeight);
        let maxHeight = 0;
        for (let i = 0; i < adapter.size; i += 1) {
            maxHeight += adapter.getItemHeight(i);
        }

        this.setState({
            height,
            maxHeight
        });
    }

    isEnding = false;
    renderItem(offTop) {
        const { adapter } = this.props;
        const items = [];
        const datas = adapter.getDataArr();
        let i = this.cacheStart;
        let h = this.listRef.current ? this.listRef.current.scrollTop - this.hideTop : 0;
        let begin = 0;
        
        for (let key = 0; i < adapter.size; i += 1, key += 1) {
            const itemH = adapter.getItemHeight(i);
            h += itemH;
            items.push(<li key={key} style={{ height: `${itemH}px` }}>{adapter.getItem(datas[i], i)}</li>);
            
            if (h >= this.state.height + offTop) {
                if(!begin) {
                    begin = i;
                } else if(i - begin > adapter.cacheItemSize) {
                    break;
                }
            }
        }
            
        this.isEnding = i >= adapter.size - 1;
        return items;
    }

    get hideTop() {
        let off = 0;
        const { adapter } = this.props;
        for(let i=0;i<this.state.start;i+=1) {
            off += adapter.getItemHeight(i);
        }
        return off;
    }

    onScroll(e) {
        const { adapter } = this.props;
        adapter.onScroll && adapter.onScroll(e);
        let maxOffY = 0
        let i = 0
        for (; i < adapter.size; i += 1) {
            let newOff = maxOffY + adapter.getItemHeight(i);
            if (e.target.scrollTop >= newOff) {
                maxOffY = newOff;
            } else {
                break;
            }
        }
        
        this.setState({ start: i });
    }

    get footHeight() {
        return this.isEnding ? 0 : this.state.maxHeight - this.state.height - this.offTop;
    }

    get cacheStart() {
        const { adapter } = this.props;
        const v = this.state.start - adapter.cacheItemSize;
        return v > 0 ? v : 0;
    }

    get offTop() {
        const { adapter } = this.props;
        let offTop = 0;
        for(let i=0;i<this.cacheStart;i+=1) {
            offTop += adapter.getItemHeight(i);
        }
        return offTop;
    }

    render() {
        const { height = '100%' } = this.props;
        const offTop = this.offTop;
        const items = this.renderItem(offTop);
        return (<ul ref={this.listRef} onScroll={this.onScroll.bind(this)} className='list' style={{ height }}>
            <li style={{ height: offTop }} />
            {items}
            <li style={{ height: this.footHeight }} />
        </ul>)
    }
}

export class Adapter {
    list = null;

    get cacheItemSize() {
        return 10;
    }

    get defaultHeight() {
        return 200;
    }

    get maxStart() {
        try {
            return this.list.state.maxStart;
        } catch (err) {
            return 0;
        }

    }

    getDataArr() {
        console.warn('请覆盖 getDataArr: Array 函数。');
        return [];
    }

    get size() {
        return this.getDataArr().length;
    }

    getItem(data, index) {
        console.warn('请覆盖 getItem: Component 函数。');
        return null;
    }

    getItemHeight(index) {
        return 0;
    }

    updateList() {
        this.list.componentDidMount();
    }

    binded(that) {
        this.list = that;
    }

    onScroll(event) {
    }

    checkItem(index) {
        if (typeof index !== 'number') return;
        setTimeout(() => {
            if (index >= 0 && index < this.size) {
                let start = index;
                let paddingTop = 0;
                index > this.list.state.maxStart && (start = this.list.state.maxStart) && (paddingTop = this.list.state.maxOff);
                this.list.setState({ start, paddingTop });
            } else {
                console.warn(`${index} 设置超出了范围。`);
            }
        }, 0)
    }
}

export default {
    Adapter,
    List
}