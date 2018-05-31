import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider } from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './DeviceFile.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(({ devicefile, loading }) => ({
  devicefile,
  loading: loading.models.devicefile,
}))
@Form.create()
export default class DeviceList extends PureComponent {
  state = {
    expandForm: false,
    selectedRows: [],
    formValues: {},
    record:{}
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'devicefile/fetchdevicelist',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'devicefile/fetchdevicelist',
      payload: params,
    });
  }

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'devicefile/fetchdevicelist',
      payload: {},
    });
  }

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleSearch = (e) => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });
      console.log(values)

      dispatch({
        type: 'devicefile/fetchdevicelist',
        payload: values,
      });
    });
  }

  handleItemDownload = (rec) => {
    console.info(rec)
    this.props.dispatch({
      type:'devicefile/devicelistdownload',
      payload:{
        id:rec.Id,
      },
    });
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="设备GUID">
              {getFieldDecorator('DeviceGuid')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { devicefile: { device }, loading } = this.props;
    const {selectedRows, record } = this.state;

    const parentMethods = {
      handleItemDownload:this.handleItemDownload,
     // handleAddModalVisible: this.handleAddModalVisible,
    };
  const columns = [
  {
    title: '设备GUID',
    dataIndex: 'DeviceGuid',
  },
  {
    title: '标签数量',
    dataIndex: 'TagCount',
  },
   {
    title: '最后心跳时间',
    dataIndex: 'LastHeartBeat',  
    render: val => <span>{moment(val).format('HH:mm:ss')}</span>, 
  },
  {
    title: '最后上传时间',
    dataIndex: 'LastUpload',
    render: val => <span>{moment(val).format('HH:mm:ss')}</span>,
  },
];

    return (
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <StandardTable
              hideSelect="true"
              selectedRows={selectedRows}
              loading={loading}
              data={device}
              columns={columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
    );
  }
}
