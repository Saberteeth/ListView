import React, { Component } from 'react';
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import './index.less';

function parabola(x, max) {
    return x * x * max / 3000;
}

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
            maxStart: 0,
            paddingTop: 0,
            maxOff: 0,
        }
        this.timer = interval(1000/60).pipe(take(60));
    }

    componentDidMount() {
        let height = 0;
        !this.listRef.current ? (height = this.props.adapter.defaultHeight) : (height = this.listRef.current.clientHeight);
        
        let h = 0;
        let i = this.props.adapter.size - 1
        for (; i >= 0 && h < height; i--) {
            h += this.props.adapter.getItemHeight(i);
        }
        
        this.setState({
            height,
            maxStart: i + 1,
            maxOff: h - height
        });
    }

    isEnding = false;
    renderItem() {
        const { adapter } = this.props;
        const { paddingTop, start } = this.state;
        const items = [];
        const datas = adapter.getDataArr();
        let h = paddingTop;
        let i = start
        for (let key = 0; i < adapter.size; i += 1, key += 1) {
            const itemH = adapter.getItemHeight(i);
            h += itemH;
            items.push(<li key={key} style={{ height: `${itemH}px`, top: `${paddingTop}px` }}>{adapter.getItem(datas[i], i)}</li>);
            if(h >= this.state.height) {
                break;
            }
        }
        this.isEnding = i >= adapter.size - 1;
        return items;
    }

    scroll(e) {
        const { adapter } = this.props;
        const offY = this.state.paddingTop - e.deltaY;
        if (this.isEnding && this.state.start >= this.state.maxStart) {
            if (this.state.start > this.state.maxStart) {
                this.setState({ paddingTop: -this.state.maxOff, start: this.state.maxStart });
                adapter.onScroll(this.state.maxStart)
                return true;
            } else if (this.state.maxOff + offY <= 0) {
                this.setState({ paddingTop: -this.state.maxOff, start: this.state.maxStart });
                adapter.onScroll(this.state.maxStart)
                return true;
            }
        }

        if (offY >= 0 && this.state.start == 0) {
            this.setState({ paddingTop: 0 });
            return true;
        }

        const willState = { paddingTop: offY };
        if (offY > 0 && this.state.start != 0) {
            willState.start = this.state.start - 1;
            willState.paddingTop = -adapter.getItemHeight(willState.start);
        } else if (adapter.getItemHeight(this.state.start) + offY <= 0) {
            willState.start = this.state.start + 1;
            willState.paddingTop = 0;
        }

        adapter.onScroll(willState.start || this.state.start);
        this.setState(willState);
        return true;
    }

    lasTouchY = 0;
    lastDelatY = 0;
    onTouchStart(e) {
        const touch = e.touches[0];
        this.lasTouchY = touch.clientY;
    }

    onTouch(e) {
        const touch = e.touches[0];
        this.lastDelatY = this.lasTouchY - touch.clientY;
        this.scroll({ deltaY: this.lastDelatY});
        this.lasTouchY = touch.clientY;
    }

    action = null;
    onTouchEnd() {
        if(Math.abs(this.lastDelatY) < 4) return false;
        if(this.action) this.action.unsubscribe();
        this.action = this.timer.subscribe(x=>{
            this.scroll({ deltaY: parabola(59 - x, this.lastDelatY)})
        });
    }

    render() {
        const { height = '100%' } = this.props;
        return (<ul ref={this.listRef} onWheel={this.scroll.bind(this)} onTouchEnd={this.onTouchEnd.bind(this)} onTouchMove={this.onTouch.bind(this)} onTouchStart={this.onTouchStart.bind(this)} className='list' style={{ height }}>
            {this.renderItem()}
        </ul>)
    }
}

export class Adapter {
    list = null;

    get defaultHeight() {
        return 200;
    }

    get maxStart() {
        try {
            return this.list.state.maxStart;
        } catch(err) {
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

    onScroll(start) {
    }

    checkItem(index) {
        if(typeof index !== 'number') return;
        setTimeout(()=>{
            if(index >= 0 && index < this.size) {
                let start = index;
                let paddingTop = 0;
                index > this.list.state.maxStart && (start = this.list.state.maxStart) && (paddingTop = this.list.state.maxOff);
                this.list.setState({ start, paddingTop });
            } else {
                console.warn(`${index} 设置超出了范围。`);
            }
        },0)
    }
}

export default {
    Adapter,
    List
}