<template>
  <div class="app-container" >
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="组长id" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入组长的用户id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会议名字" prop="conferenceName">
        <el-input
          v-model="queryParams.conferenceName"
          placeholder="请输入创建会议的名字"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会议描述" prop="conferenceIntro">
        <el-input
          v-model="queryParams.conferenceIntro"
          placeholder="请输入会议描述"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="开始时间" prop="conferenceStartTime">
        <el-date-picker clearable size="small" style="width: 200px"
                        v-model="queryParams.conferenceStartTime"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="选择会议开始时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="conferenceEndTime">
        <el-date-picker clearable size="small" style="width: 200px"
                        v-model="queryParams.conferenceEndTime"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="选择会议结束时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="参会人" prop="confJoinId">
        <el-input
          v-model="queryParams.confJoinId"
          placeholder="请输入会议参加人"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:conference:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:conference:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:conference:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:conference:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="conferenceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="会议id" align="center" prop="conferenceId" />
      <el-table-column label="组长id" align="center" prop="userId" />
      <el-table-column label="创建会议的名字" align="center" prop="conferenceName" />
      <el-table-column label="会议描述" align="center" prop="conferenceIntro" />
      <el-table-column label="开始时间" align="center" prop="conferenceStartTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.conferenceStartTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="conferenceEndTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.conferenceEndTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="参会人" align="center" prop="confJoinId" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:conference:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:conference:remove']"
          >删除</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="joinSealMeeting(scope.row,user.userName)"
          >加入会议</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="550px">
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="组长用户id" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入组长的用户id" />
        </el-form-item>
        <el-form-item label="会议名字" prop="conferenceName">
          <el-input v-model="form.conferenceName" placeholder="请输入创建会议的名字" />
        </el-form-item>
        <el-form-item label="会议描述" prop="conferenceIntro">
          <el-input v-model="form.conferenceIntro" placeholder="请输入会议描述" />
        </el-form-item>
        <el-form-item label="开始时间" prop="conferenceStartTime">
          <el-date-picker clearable size="small" style="width: 200px"
                          v-model="form.conferenceStartTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="选择会议开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="conferenceEndTime">
          <el-date-picker clearable size="small" style="width: 200px"
                          v-model="form.conferenceEndTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="选择会议结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="参会人" prop="confJoinId">
          <el-input v-model="form.confJoinId" placeholder="请输入会议参加人的id" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { listConference, getConference, delConference, addConference, updateConference, exportConference } from "@/api/conference";
  import { getUserProfile } from "@/api/system/user";
  export default {
    data() {
      return {
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 总条数
        total: 0,
        // 【请填写功能名称】表格数据
        conferenceList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          userId: undefined,
          conferenceName: undefined,
          conferenceIntro: undefined,
          conferenceStartTime: undefined,
          conferenceEndTime: undefined,
          confJoinId: undefined
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          userId: [
            { required: true, message: "组长的用户id不能为空", trigger: "blur" }
          ],        conferenceName: [
            { required: true, message: "创建会议的名字不能为空", trigger: "blur" }
          ],        conferenceIntro: [
            { required: true, message: "会议描述不能为空", trigger: "blur" }
          ],        confJoinId: [
            { required: true, message: "会议参加人的id不能为空", trigger: "blur" }
          ]
        },
        //获取个人信息
        user: {}
      };
    },
    created() {
      this.getList();
      this.getUser();
    },
    methods: {
      /** 查询【请填写功能名称】列表 */
      getList() {
        this.loading = true;
        listConference(this.queryParams).then(response => {
          this.conferenceList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },
      // 取消按钮
      cancel() {
        this.open = false;
        this.reset();
      },
      // 表单重置
      reset() {
        this.form = {
          conferenceId: undefined,
          userId: undefined,
          conferenceName: undefined,
          conferenceIntro: undefined,
          conferenceStartTime: undefined,
          conferenceEndTime: undefined,
          confJoinId: undefined
        };
        this.resetForm("form");
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.pageNum = 1;
        this.getList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm("queryForm");
        this.handleQuery();
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.conferenceId)
        this.single = selection.length!=1
        this.multiple = !selection.length
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
        this.title = "添加会议";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const conferenceId = row.conferenceId || this.ids
        getConference(conferenceId).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改会议";
        });
      },
      /** 提交按钮 */
      submitForm: function() {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.conferenceId != undefined) {
              updateConference(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              });
            } else {
              addConference(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("新增成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              });
            }
          }
        });
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const conferenceIds = row.conferenceId || this.ids;
        this.$confirm('是否确认删除会议编号为"' + conferenceIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delConference(conferenceIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams;
        this.$confirm('是否确认导出所有会议数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportConference(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
      },
      joinSealMeeting(row,username){
        const conferenceIds = row.conferenceId || this.ids;
        window.location.href="https://scxt.hbhb.vip/sealmeeting?mId="+conferenceIds+"&"+"username="+username;
      },
      getUser() {
        getUserProfile().then(response => {
          this.user = response.data;
        });
      }
    }
  };
</script>
