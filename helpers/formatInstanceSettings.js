/**
 * @formatted
 * {
 *  _id: string,
 *  color: string,
 *  label
 * }
 * 
 * @param {*} instancePayload 
 * @returns 
 * 
 */
const formatInstanceSettings = (instancePayload) => {
    const { _id, color, label, status, sub_id, is_loading, instance_id, channel, label_server, setting_sync, ...instance_data } = instancePayload

    return { _id, color, label, status, sub_id, is_loading, instance_id, channel, label_server, setting_sync, instance_data }
}

module.exports = formatInstanceSettings