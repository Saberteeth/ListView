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
            height: 0,
            maxHeight: 0,
            offTop: 0,
        }
    }

    componentDidMount() {
        const { adapter } = this.props;
        let height = 0;
        !this.listRef.current ? (height = adapter.defaultHeight) : (height = this.listRef.current.clientHeight);
        const maxHeight = adapter.getItemHeight() * adapter.size;
        if(maxHeight > 16000000) {
            throw new Error('总高度已超出上限！');
        }
        if(maxHeight < this.state.maxHeight) {
            this.setState({
                start: 0,
                offTop: 0,
            });
            this.listRef.current && (this.listRef.current.offTop = 0);
        }
        this.setState({
            height,
            maxHeight,
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
        const last = (off) => {
            return Math.round(((off - e.target.scrollTop)/adapter.getItemHeight()) + .5);
        }
       
        const next = (off) => {
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
        this.lastTop =  e.target.scrollTop;
        this.setState({ start, offTop },()=>{
            // 修正高度
            this.listRef.current.scrollTop = this.lastTop;
        });
    }
    lastTop = 0;

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

    get defaultHeight() {
        return 200;
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

}

export default {
    Adapter,
    List
}