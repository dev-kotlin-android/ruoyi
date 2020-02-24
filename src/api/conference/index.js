import request from '@/utils/request'

// 查询会议列表
export function listConference(query) {
  return request({
    url: '/system/conference/list',
    method: 'get',
    params: query
  })
}

// 查询会议详细
export function getConference(conferenceId) {
  return request({
    url: '/system/conference/' + conferenceId,
    method: 'get'
  })
}

// 新增会议
export function addConference(data) {
  return request({
    url: '/system/conference',
    method: 'post',
    data: data
  })
}

// 修改会议
export function updateConference(data) {
  return request({
    url: '/system/conference',
    method: 'put',
    data: data
  })
}

// 删除会议
export function delConference(conferenceId) {
  return request({
    url: '/system/conference/' + conferenceId,
    method: 'delete'
  })
}

// 导出会议
export function exportConference(query) {
  return request({
    url: '/system/conference/export',
    method: 'get',
    params: query
  })
}
