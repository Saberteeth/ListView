import React, { Component } from 'react';
import './index.less';
// import Operator from './operator';
// const { by, operator, operators } = Operator;
// const { throttleTime } = operators;

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
            height: 0,
            maxHeight: 0,
            offTop: 0,
        }
    }

    componentDidMount() {
        const { adapter } = this.props;
        let height = 0;
        !this.listRef.current ? (height = this.props.adapter.defaultHeight) : (height = this.listRef.current.clientHeight);
        this.setState({
            height,
            maxHeight: adapter.getItemHeight() * adapter.size
        });
    }

    footer = 0;
    renderItem() {
        const { adapter } = this.props;
        const items = [];
        const datas = adapter.getDataArr();
        const offH = this.listRef.current ? (this.listRef.current.scrollTop - this.state.offTop) : 0;
        let h = 0;
        let i = this.state.start;
        for (let key = 0; i < adapter.size; i += 1, key += 1) {
            h += adapter.getItemHeight();
            items.push(<li key={key} style={{ height: adapter.getItemHeight() }}>{adapter.getItem(datas[i], i)}</li>);
            
            if(h > this.state.height + offH) {
                break;
            }
        }
        
        this.footer = this.state.maxHeight - this.state.offTop - h;
        return items;
    }
    
    onScroll(e) {
        const { adapter } = this.props;
        let { start, offTop } = this.state;
        const last = (off, index = 1) => {
            return Math.round(((off - e.target.scrollTop)/adapter.getItemHeight()) + .5);
        }
       
        const next = (off, index = 1) => {
            return Math.round(((e.target.scrollTop - off)/adapter.getItemHeight()) + .5);
        }
       
        if(e.target.scrollTop < offTop) {
            // 加载上一条
            const offIndex = last(offTop);
            start -= offIndex;
            offTop -= offIndex * adapter.getItemHeight();
        } else if(e.target.scrollTop > offTop + adapter.getItemHeight()) {
            //加载下一条
            const offIndex = next(offTop + adapter.getItemHeight());
            start += offIndex;
            offTop += offIndex * adapter.getItemHeight();
        }
        start < 0 && (start = 0, offTop = 0);
        const lastScrollTop =  e.target.scrollTop;
        this.setState({ start, offTop },()=>{
            // 修正高度
            this.listRef.current.scrollTop = lastScrollTop;
        });
    }

    get footHeight() {
        return this.isEnding ? 0 : this.state.maxHeight - this.state.height - this.offTop;
    }

    render() {
        const { height = '100%' } = this.props;
        const items = this.renderItem();
        return (<ul ref={this.listRef} onScroll={this.onScroll.bind(this)} className='list' style={{ height }}>
            <li style={{ height: this.state.offTop }} />
            {items}
            <li  style={{ height: this.footer }}/>
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

    getItemHeight() {
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