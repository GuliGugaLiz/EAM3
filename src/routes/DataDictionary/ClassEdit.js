import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Moment from 'moment';
import {
    Row,
    Col,
    Card,
    Form,
    Input,
    Select,
    Icon,
    Button,
    Dropdown,
    Menu,
    InputNumber,
    Switch,
    DatePicker,
    Modal,
    message,
    Badge,
    Divider
} from 'antd';

import styles from './ClassEdit.less';
const { TextArea } = Input;


const FormItem = Form.Item;
@Form.create()
export default class ClassEdit extends PureComponent {
    state = {
        confirmDirty: false
    };

    render() {
        const { record,modalVisible, form, handleEdit, handleModalVisible } = this.props;
        const { getFieldDecorator, getFieldValue } = form;
        const okHandle = () => {
            form.validateFields((err, fieldsValue) => {
                if (err) return;
                form.resetFields();
                this.props.handleEdit(record.key,fieldsValue);
            });
        };
        const formItemLayout = {
            labelCol: {
                xs: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 16 },
            },
        };
        const formItemLayout2 = {
            labelCol: {
                xs: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 20 },
            },
        };

        const style = {
            right:'4px'
        };

        const inputNumStyle = {
            width:'100%'
        };
        return ( <
            Modal title = "编辑资产分类信息" 
            visible = { modalVisible }
            onOk = { okHandle }
            onCancel = {
                () => this.props.handleEditModalVisible()
            } >
           
            <Row gutter={24}>
            <Col span={12}>
            <FormItem {...formItemLayout}
            label="编号"
            >
            <span style={{color:'black'}}>{record.name}</span>
            </FormItem>
            </Col>           
            </Row>

            <Row gutter={24}>
            <Col span={12}>
            <FormItem {...formItemLayout}
            label="资产名称"
            >
            <span>{record.province}</span>
            </FormItem>
            </Col>          
            </Row>            

            <Row gutter={24}>
            <Col span={12}>
            <FormItem {...formItemLayout}
            label = "创建时间"> {
                form.getFieldDecorator('createTime',{
                    rules:[{required: true, message: '必须输入创建时间'}],
                    initialValue:Moment(record.createTime)
                })(<DatePicker showTime format="YYYY-MM-DD" />
            )
            }
            </FormItem>
            </Col>
            <Col span={12}>
            <FormItem {...formItemLayout}
            label = "创建者"> {
                form.getFieldDecorator('createUserId',{
                    rules:[{required: true, message: '必须输入创建者'}],
                    initialValue:record.createUserId
                })(<Input placeholder = "请输入创建者" />
            )
            }
            </FormItem>
            </Col>
            </Row>

            <Row gutter={24}>
            <Col span={24}>
            <FormItem {...formItemLayout2 }
            style={style}
            label = "备注" > {
                getFieldDecorator('memo', {
                    rules: [{}],
                    initialValue:record.memo
                })( <
                    TextArea style = {
                        { minHeight: 32 }
                    }
                    placeholder = "请输入备注"
                    rows = { 4 }
                    />
                )
            } </FormItem> 
            </Col>
            </Row> 
             
            </Modal >
        );
    }
}