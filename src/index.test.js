import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import ListView from './index';
import expect from 'expect';

const { List, Adapter } = ListView;

describe('List 功能完整性测试。', () => {
    const obj = { data: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
    
    class MyAdapter extends Adapter {
        getDataArr() {
            return obj.data;
        }

        getItem(data, index) {
            return <div>{data}</div>;
        }

        getItemHeight(i) {
            return 50//i%2 == 0 ? 50: 80;
        }
    }
    const adapter = new MyAdapter();
    const testRenderer = ReactTestRenderer.create(
        <List adapter={adapter}/>
    );

    it('自动计算出正确的当前展示长度测试',()=>{
        expect(testRenderer.root.findAll(node => node.type === 'li').length).toBe(4);
    })

    it('updateList 更新渲染测试', ()=>{
        obj.data = [10,11];
        adapter.updateList();
        expect(testRenderer.root.findAll(node => node.type === 'li').length).toBe(2);
    });
});