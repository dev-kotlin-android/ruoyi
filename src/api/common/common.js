import request from '@/utils/request'

export function down(url) {
  return request({
    url: url,
    method: 'get',

  })
}
