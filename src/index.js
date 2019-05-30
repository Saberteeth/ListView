import React, { Component } from 'react';
import './index.less';

export class List extends Component {
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
            offTop: 0,
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
    renderItem() {
        const { adapter } = this.props;
        const { start, offTop } = this.state;
        const items = [];
        const datas = adapter.getDataArr();
        let i = start;
        let h = this.listRef.current ? this.listRef.current.scrollTop : 0;
        let ended = 0;
        const cache = adapter.cacheItemSize < 1 ? adapter.cacheItemSize * adapter.size : adapter.cacheItemSize;
        
        for (let key = 0; i < adapter.size; i += 1, key += 1) {
            const itemH = adapter.getItemHeight(i);
            h += itemH;
            items.push(<li key={key} style={{ height: `${itemH}px` }}>{adapter.getItem(datas[i], i)}</li>);
            if(ended > cache) break;
            if (h >= this.state.height + offTop) {
                ended += 1;
            }
        }
            
        this.isEnding = i >= adapter.size - 1
        return items;
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
        this.setState({ start: i, offTop: maxOffY });

    }

    get footHeight() {
        return this.state.maxHeight - this.state.height - this.state.offTop;
    }

    render() {
        const { height = '100%' } = this.props;
        const footStyle = {};
        const headStyle = {};
        if(this.isEnding) {
            footStyle.height = 0;
            headStyle.height = this.state.maxHeight - this.state.height;
        } else {
            footStyle.height = this.footHeight;
            headStyle.height = this.state.offTop;
        }
        
        return (<ul ref={this.listRef} onScroll={this.onScroll.bind(this)} className='list' style={{ height }}>
            <li style={{ height: this.state.offTop }} />
            {this.renderItem()}
            <li style={footStyle} />
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