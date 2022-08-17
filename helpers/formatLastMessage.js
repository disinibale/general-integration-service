const formatLastMessage = (message) => {
    const {
      data,
      seen,
      files,
      fromMe,
      content,
      seen_by,
      sender_id,
      source_id,
      timestamp,
      distributed,
      sender_name,
      original_message,
      content_notification,
    } = message;
  
    const formattedLastMessage = {
      data,
      seen,
      files,
      fromMe,
      content,
      seen_by,
      sender_id,
      source_id,
      timestamp,
      distributed,
      sender_name,
      original_message,
      content_notification,
    };
  
    return formattedLastMessage;
  };

  module.exports = formatLastMessage