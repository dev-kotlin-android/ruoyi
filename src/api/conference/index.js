import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listConference(query) {
  return request({
    url: '/system/conference/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getConference(conferenceId) {
  return request({
    url: '/system/conference/' + conferenceId,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addConference(data) {
  return request({
    url: '/system/conference',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateConference(data) {
  return request({
    url: '/system/conference',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delConference(conferenceId) {
  return request({
    url: '/system/conference/' + conferenceId,
    method: 'delete'
  })
}

// 导出【请填写功能名称】
export function exportConference(query) {
  return request({
    url: '/system/conference/export',
    method: 'get',
    params: query
  })
}
