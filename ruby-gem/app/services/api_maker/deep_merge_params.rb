class ApiMaker::DeepMergeParams < ApiMaker::ApplicationService
  attr_reader :hash1, :hash2

  def initialize(hash1, hash2)
    @hash1 = hash1
    @hash2 = hash2
  end

  def perform
    merged_hash = hash1.deep_merge(hash2) do |_key, this_val, other_val|
      if this_val.is_a?(Array) && other_val.is_a?(Array) && this_val.length == other_val.length
        this_val.zip(other_val).collect do |a, b|
          if a.is_a?(Hash) && b.is_a?(Hash)
            a.deep_merge(b)
          else
            other_val
          end
        end
      else
        other_val
      end
    end

    succeed! merged_hash
  end
end
