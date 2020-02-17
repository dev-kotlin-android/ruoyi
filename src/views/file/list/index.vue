<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="文件名称" prop="fileName">
        <el-input
          v-model="queryParams.fileName"
          placeholder="请输入文件名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="上传时间" prop="upTime">
        <el-date-picker clearable size="small" style="width: 200px"
                        v-model="queryParams.upTime"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="选择上传时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="上传者的id" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入上传者的id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="文件分类" prop="fileSort">
        <el-input
          v-model="queryParams.fileSort"
          placeholder="请输入文件分类"
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
          v-hasPermi="['system:file:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:file:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:file:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:file:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="fileList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="文件id" align="center" prop="fileId" />
      <el-table-column label="文件名称" align="center" prop="fileName" />
      <el-table-column label="上传时间" align="center" prop="upTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.upTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上传者的id" align="center" prop="userId" />
      <el-table-column label="文件分类" align="center" prop="fileSort" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:file:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:file:remove']"
          >删除</el-button>
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

    <!-- 添加或修改文件对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
<!--        <el-form-item label="文件名称" prop="fileName">-->
<!--          <el-input v-model="form.fileName" placeholder="请输入文件名称" />-->
<!--        </el-form-item>-->
<!--        <el-form-item label="上传时间" prop="upTime">-->
<!--          <el-date-picker clearable size="small" style="width: 200px"-->
<!--                          v-model="form.upTime"-->
<!--                          type="date"-->
<!--                          value-format="yyyy-MM-dd"-->
<!--                          placeholder="选择上传时间">-->
<!--          </el-date-picker>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="上传者得id" prop="userId">-->
<!--          <el-input v-model="form.userId" placeholder="请输入上传者得id" />-->
<!--        </el-form-item>-->
        <el-form-item>
          <el-upload
            class="upload-demo"
            action="https://jsonplaceholder.typicode.com/posts/"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
            multiple
            :limit="1"
            :on-exceed="handleExceed"
            :file-list="fileList">
            <el-button size="small" type="primary">点击上传文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传word文件</div>
          </el-upload>
        </el-form-item>


        <el-form-item label="文件分类" prop="fileSort">
          <el-input v-model="form.fileSort" placeholder="请输入文件分类" />
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
  import { listFile, getFile, delFile, addFile, updateFile, exportFile } from "@/api/file/fileinfo";
  import { uploadAvatar } from "@/api/system/user";

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
        fileList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          fileName: undefined,
          upTime: undefined,
          userId: undefined,
          fileSort: undefined
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          fileName: [
            { required: true, message: "文件名称不能为空", trigger: "blur" }
          ],        upTime: [
            { required: true, message: "上传时间不能为空", trigger: "blur" }
          ],        userId: [
            { required: true, message: "上传者得id不能为空", trigger: "blur" }
          ],        fileSort: [
            { required: true, message: "文件分类不能为空", trigger: "blur" }
          ]
        },
        fileList: []
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询文件列表 */
      getList() {
        this.loading = true;
        listFile(this.queryParams).then(response => {
          this.fileList = response.rows;
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
          fileId: undefined,
          fileName: undefined,
          upTime: undefined,
          userId: undefined,
          fileSort: undefined
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
        this.ids = selection.map(item => item.fileId)
        this.single = selection.length!=1
        this.multiple = !selection.length
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
        this.title = "添加文件";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const fileId = row.fileId || this.ids
        getFile(fileId).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改文件";
        });
      },
      /** 提交按钮 */
      submitForm: function() {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.fileId != undefined) {
              updateFile(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              });
            } else {
              addFile(this.form).then(response => {
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
        const fileIds = row.fileId || this.ids;
        this.$confirm('是否确认删除文件编号为"' + fileIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delFile(fileIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams;
        this.$confirm('是否确认导出所有文件数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportFile(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
      },
      /**
       * 上传文件操作
       */
      handleRemove(file, fileList) {
        console.log(file, fileList);
      },
      handlePreview(file) {
        uploadAvatar(file).then(response => {
          if (response.code === 200) {
            this.fileList = response.

            this.msgSuccess("上传成功");
          } else {
            this.msgError(response.msg);
          }
          this.$refs.cropper.clearCrop();
        });
      },
      handleExceed(files, fileList) {
        this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
      },
      beforeRemove(file, fileList) {
        return this.$confirm(`确定移除 ${ file.name }？`);
      },


    }
  };
</script>
